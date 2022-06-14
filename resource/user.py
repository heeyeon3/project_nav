from curses.ascii import NUL
from operator import le
from sqlalchemy.sql.expression import null
from models.user import UserModel
from flask import request, render_template, redirect, url_for
from flask_restful import Resource, reqparse
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from flask_login import login_user, logout_user, current_user, login_required
from resource.log import LogMessage
# from resource.group import GroupModel
from flask import g
import json
import logging
from datetime import datetime

import re

# 사용자 로그인
class UserLogin(Resource):

    print("LOGIN FUNCTION ENTERRED !!!!! ")
    parse = reqparse.RequestParser()

    

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_pwd', type=str)
    parse.add_argument('next', type=str)

    def post(self):

        print("LOGIN FUNCTION post ENTERRED !!!!! ")

        params = UserLogin.parse.parse_args()

        user_id = params['user_id']
        user_pwd = params['user_pwd']
        next_url = params['next']
        
        test = '[\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result = re.findall(test, user_id)

        if len(result) > 0 : 
            return {'resultCode': '100', "resultString": "FAIL"}, 400  


        # print(next_url + " : " + str(request.arg.get("next")))

        user_obj = UserModel.find_by_id(user_id)


        # if(user_id == 'admin'):
        #     #create user password
            # print("admin phase !!!------------")
            # user_obj.set_password('admin123!@#')
        #     user_obj.set_password('master') <== ds.fvn.co.kr 

        if user_obj is None:
            print("user_obj is None")
            return {'resultCode': '100', "resultString": "사용자 인증 실패"}, 200  # 인증실패 (결함리포트 2 - 3)
        else:
            print(user_obj.user_yn)
            if user_obj.user_yn == "N":
                return {'resultCode': '100', "resultString": "삭제된 아이디 입니다."}, 200  
            # 패스워드 비교
            # print(user_pwd)
            if user_obj.check_password(user_pwd):

                # Arnold added. 최초생성 패스워드와 아이디가 동일하면 패스워드 수정하게 만든다. 무조건 !!!!
                if user_obj.check_id_pwd(user_id):
                    return {'resultCode': '101', "resultString": "패스워드와 아이디가 같습니다. 패스워드를 수정해주십시오."}, 200  # 인증실패

                conn_time = [dict(r) for r in user_obj.check_time()]

                # 유저가 휴면 계정 해지 후 혹은 계정 작성후 첫 접속시
                if conn_time[0]['DiffDo'] == None:
                    user_obj.user_conn_date = datetime.now()

                # 유저 접속후 90일 이상 경과한경우
                elif conn_time[0]['DiffDo'] >= 90:
                    user_obj.user_dor_acc = "Y"
                    user_obj.user_conn_date = datetime.now()
                    user_obj.save_to_db()
                    return {'resultCode': '100', "resultString": "해당 계정은 휴면 계정입니다. 관리자 문의를 통해 휴면을 해제해 주십시오."}, 200  # 인증실패

                if conn_time[0]['DiffPw'] >= 90:
                    return {'resultCode': '101', "resultString": "패스워드 수정후 90일 이상 경과하였습니다 패스워드를 수정해주십시오."}, 200  # 인증실패

                user_obj.user_auth = True
                user_obj.user_conn_date = datetime.now()
                login_user(user_obj, remember=True)

                # 현재 로그인 사용자 업데이트
                user_obj.save_to_db()

                # 정상 로그인 로그 남기기
                LogMessage.set_message("msg_login", str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')), "0501")

            else:
                # 로그인 실패 로그 남기기
                LogMessage.set_login_fail_message("msg_login_fail",
                                                 str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                                                 user_id, "0501")



                user_fail_count = user_obj.user_fail_count
                print(user_fail_count)
                if user_fail_count == None :
                    print("user_fail_count")
                    user_fail_count = 0
                    user_obj.user_fail_count = 0
                    user_obj.save_to_db()


                if user_id != 'admin':
                    user_fail_count = int(user_fail_count)+1
                    user_obj.user_fail_count =user_fail_count
                    user_obj.save_to_db()
                    print(user_fail_count)

           
                    


                if(int(user_fail_count)  >= 5):
                    return {'resultCode': '100', "resultString": "5번 이상 실패로 계정이 잠겼습니다."}, 200  # 인증실패
                else:
                    return {'resultCode': '100', "resultString": "사용자 인증 실패"}, 200  # 인증실패   (결함리포트 2 - 3)
        # 슈퍼어드민 또는 어드민 또는 설치팀인 경우
        # if user_obj.user_gr == "0101" or user_obj.user_gr == "0102" or user_obj.user_gr == "0106":
        #     next_url = "/dashboard"
        # elif user_obj.user_gr == "0103":
        #     # 사용자 로그인시에 그룹장일 경우 사용자의 user 정보에 group_no 를 세팅 해 줍니다. 
        #     group_no = GroupModel.find_group_no_by_id(user_obj.user_id)

        #     if(group_no != None):
        #         # group_seq update every login Time !!!!
        #         user_obj.group_seq = group_no.group_seq
        #         user_obj.save_to_db()
        #         # print("User group_no updated !!!")
        #         next_url = "/dashboard"
        #     else:
        #         print("아직 그룹이 만들어 지지 않았습니다.")
        #         next_url = "/group"

        if int(user_obj.user_fail_count) >= 5 :
            return {'resultCode': '100', "resultString": "5번 이상 실패로 계정이 잠겼습니다."}, 200  # 인증실패

        else:
            user_gr = user_obj.user_gr   
            project_id = user_obj.project_id  

            user_obj.user_fail_count = 0
            user_obj.save_to_db()

            if(user_gr == '0101'):
                next_url = "/Project_list"
            elif(user_gr == '0102'):
                next_url = "/Project_list"
            else:
                next_url = "/Location_list"
            print("next_url",next_url)
            return {'resultCode': '0', "resultString": "SUCCESS", "next_url": next_url}, 200


# 사용자 로그아웃 처리
class UserLogout(Resource):

    @login_required
    def post(self):

        user = current_user

        user_obj = UserModel.find_by_id(user.user_id)
        user_obj.user_auth = False
        user_obj.save_to_db()

        # print("로그아웃 USER >> " + user.user_id + " : " + user.user_gr + ":" + str(user.user_auth))

        # 로그 남기기
        LogMessage.set_message("msg_logout", str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')), "0501")

        logout_user()
        return {'resultCode': '0', "resultString": "로그아웃 되었습니다."}, 200


# 사용자 비밀번호 찾기
class UserPwFind(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('user_dept_nm', type=str)
    parse.add_argument('user_new_pwd', type=str)

    def post(self):
        # Searching Password with ID, name, department
        print("***PW FIND POST****")

        params = User.parse.parse_args()

        user_id = params['user_id']
        user_nm = params['user_nm']
        user_dept_nm = params['user_dept_nm']             
        found_password = UserModel.get_password(user_id, user_nm, user_dept_nm)
        final_list = [{
            'user_pwd': row[0],

        } for row in found_password]

        found_password = json.dumps(final_list, cls=jsonEncoder)
        print(type(final_list[0]))
        print(final_list[0]['user_pwd'])

    def put(self, user_id_verify):
        params = UserPwFind.parse.parse_args()
        user_pwd = params['user_new_pwd']

        try:
            user_obj = UserModel.find_by_id(user_id_verify)
            user_obj.set_password(user_pwd)
            user_obj.user_pwd_change_dt = datetime.now()
            user_obj.modify_date = datetime.now()
            user_obj.save_to_db()
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500

        return {'resultCode': '0', "resultString": user_id_verify + " 사용자 정보가 수정 되었습니다."}, 200



# 사용자 (조회/등록/수정/삭제)
class User(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_pwd', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('user_email', type=str)
    parse.add_argument('user_gr', type=str)
    parse.add_argument('project_id', type=str)
    parse.add_argument('user_yn', type=str)

    parse.add_argument('current_user_pwd', type=str)
    parse.add_argument('pwd_lock', type=str)

  

    ## user 등록
    def post(self):
        print("등록 화면으로 들어옴")
        params = User.parse.parse_args()

        user_id = params['user_id']
        user_pwd = params['user_pwd']
        user_nm = params['user_nm']
        user_email = params['user_email']
        user_gr = params['user_gr'] 
        project_id = params['project_id']
        user_yn = params['user_yn']
        create_user_id = current_user.user_id         

        create_date = datetime.now()
        modify_date = datetime.now()

     
       
        if(project_id == 'all' or project_id == '' or user_gr == '0102'):
            project_id = None

        user_id_obj = UserModel.find_by_id(user_id)

        if(user_id_obj):
            return {'resultCode': '100', "resultString": user_id + " 는 중복된 아이디 입니다."}, 200
        elif(user_id == user_pwd):
            return {'resultCode': '100', "resultString":  "아이디와 비밀번호가 같습니다."}, 200
        else:

            try:
                # user_id, user_pwd, user_nm, user_gr, user_email, project_id, user_dor_acc, user_yn, user_auth, create_user_id)
                user_obj = UserModel(user_id, user_pwd, user_nm, user_gr, user_email, project_id,"N", user_yn, False,  0, create_user_id,create_date, modify_date)
                
                user_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

            return {'resultCode': '0', "resultString": user_id + " 사용자가 등록 되었습니다."}, 200
    ## user 정보 수정
    def  put(self):

        params = User.parse.parse_args()
        print(params)
        user_id = params['user_id']
        user_pwd = params['user_pwd']
        user_nm = params['user_nm']
        user_email = params['user_email']

        user_gr = params['user_gr'] 
        project_id = params['project_id']

        user_yn = params['user_yn']
        current_user_pwd = params['current_user_pwd']

        # current_user_id = current_user.user_id
        current_user_id = "admin"
        pwd_lock = params['pwd_lock']
        print(current_user_id)


        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        if user_id is not None :
            result_project = re.findall(test, user_id)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if user_nm is not None :
            result_project = re.findall(test, user_nm)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if user_email is not None :
            result_project = re.findall(test, user_email)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400


        if user_yn != "Y" and user_yn != "N" :
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        print("CHECK PROJECT ", result_project)

        

        try :
            if user_gr and len(user_gr) > 0 :
                int(user_gr)
            
            if project_id and len(project_id) > 0 :
                int(project_id)

            if pwd_lock and len(pwd_lock) > 0 :
                int(pwd_lock)

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400



        current_user_obj = UserModel.find_by_id(current_user_id)
        if current_user_obj.check_password(current_user_pwd):

            if(project_id == 'all' or project_id == '' or user_gr == '0102'):
                project_id = None

            

            user_obj = UserModel.find_by_id(user_id)
            if(pwd_lock == '0'):
                print("!!")
                user_obj.user_fail_count = 0
            user_obj.user_nm = user_nm
            user_obj.user_email = user_email
            user_obj.user_gr = user_gr
            user_obj.project_id = project_id
            user_obj.user_yn = user_yn

            if(user_pwd):
                user_obj.set_password(user_pwd)
                user_obj.user_pwd_change_dt = datetime.now()
                user_obj.modify_date = datetime.now()
                

            try:
                user_obj.save_to_db()
                # print("!!")
                

            except Exception as e:
                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500

            return {'resultCode': '0', "resultString": " 사용자 정보가 수정 되었습니다."}, 200


        else:
            return {'resultCode': '0', "resultString": "비밀번호가 올바르지 않습니다."}, 200

    def delete(self):
        params = User.parse.parse_args()
        user_id = json.loads(params['user_id'])
        print(params)
        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        for idx in range(len(user_id)) :

            if user_id[idx] is not None :
                result_project = re.findall(test, user_id[idx])

            print("CHECK PROJECT ", result_project)

            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        # user_id = params['user_id']
        for r in range(len(user_id)) :
            try:
                user_obj = UserModel.find_by_id(user_id[r])
                if user_obj.user_yn == 'Y':
                    user_obj.user_yn = 'N'
                    user_obj.modify_date = datetime.now()
                    user_obj.delete_to_db()
                else:
                    user_obj.user_yn = 'Y'
                    user_obj.modify_date = datetime.now()

                    user_obj.save_to_db()
            except Exception as e:
                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": user_obj.user_id + "사용유무 변경 시 에러가 발생했습니다."}, 500

        return {'resultCode': '0', "resultString": "사용유무가 변경 되었습니다."}, 200

class userlist(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('user_id', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('comm_nm', type=str)
    parse.add_argument('project_name', type=str)
    parse.add_argument('user_email', type=str)
    parse.add_argument('user_gr', type=str)
    parse.add_argument('project_id', type=str)


    # user data 보여주기
    def post(self):

        params = userlist.parse.parse_args()

        print(params)

        # 사용자 등록

        user_id =                   params['user_id']
        user_nm =                   params['user_nm']
        comm_nm =                   params['comm_nm']
        project_name =              params['project_name']
        user_email =                params['user_email']
        user_gr =                   params['user_gr']
        project_id =                params['project_id']

        # start = params['start']
        # length = params['length']

        print("CHECK PROJECT ", user_id, user_nm, comm_nm, project_name, user_email, user_gr)

        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        if comm_nm is not None :
            result_project = re.findall(test, comm_nm)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if project_name is not None :
            result_project = re.findall(test, project_name)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if user_nm is not None :
            result_project = re.findall(test, user_nm)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400
        
        if user_id is not None :
            result_project = re.findall(test, user_id)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if user_email is not None :
            result_project = re.findall(test, user_email)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400


        print("CHECK PROJECT ", result_project)

        

        try:
            #sql injection
            if project_id and len(project_id) > 0 :
                int(project_id)

            if user_gr and len(project_id) > 0 :
                int(user_gr)
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        param = (user_id, user_nm, project_name,comm_nm, user_email, user_gr, project_id)
        res_data = {}
        
        res_data['data'] = [dict(r) for r in UserModel.find_all_user(param)]
        # print(res_data)

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"

        return res_data, 200


# 수정 버튼 클릭시 데이터 가져오기
class user_Edit_button(Resource):
    
    parse = reqparse.RequestParser()
    parse.add_argument('user_id', type=str)

    def get(self):

        result_string = {}
        user_id =              request.args.get('user_id')

        if len(user_id) > 0 :
            test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
            result_project = ''

            if user_id is not None :
                result_project = re.findall(test, user_id)

            print("CHECK PROJECT ", result_project)

            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400


        
            result_string = [dict(r) for r in UserModel.find_by_id_edit(user_id)]

            if len(result_string) == 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

            return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200
      
        else : 
            return {'resultCode': '100', "resultString": "FAIL"}, 400


# 현재 사용자 정보 가져오기
class current_user_info(Resource):
    
    parse = reqparse.RequestParser()
    parse.add_argument('user_id', type=str)
    parse.add_argument('status', type=str)

    def get(self):

        status = request.args.get('status')
        
        if status != "1000" :
            return {'resultCode': '100', "resultString": "FAIL"}, 400 

        result_string = {}
        user_id =              current_user.user_id
        print(user_id)
        result_string = json.dumps(UserModel.find_by_id(user_id), cls=jsonEncoder)
        print("result_string", result_string)

        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200


# 최초 사용자 생성 admin

class firstuser(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('user_pwd', type=str)

    def post(self):
        
        print("UserRegister POST ..")

        params = firstuser.parse.parse_args()
        user_pwd = params['user_pwd']

        print(params)

        firstuser_obj = UserModel.find_by_id("admin")
        print("result_string", firstuser_obj)

        create_date = datetime.now()
        modify_date = datetime.now()

        if(firstuser_obj):
            return {'resultCode': '100', "resultString": " 중복되었습니다."}, 200
  

        # user_id, user_pwd, user_nm, user_gr, user_email, project_id, user_dor_acc, user_yn, user_auth, create_user_id)
        # user_obj = UserModel(user_id, user_pwd, user_nm, user_gr, user_email, project_id,"N", user_yn, False, create_user_id)
        else:
            try:
                user_obj = UserModel("admin",user_pwd, None, "0101", None, None,"N", "Y", False, 0, "admin" , create_date, modify_date)
                
                user_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 등록 되었습니다."}, 200


#########################################################################################


# 사용자 메인 및 검색 조회
class UserSearch(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('user_id', type=str)
    parse.add_argument('user_pwd', type=str)
    parse.add_argument('user_nm', type=str)
    parse.add_argument('user_gr', type=str)
    parse.add_argument('group_seq', type=str)
    parse.add_argument('start', type=str)
    parse.add_argument('length', type=str)

    def get(self):

        params = UserSearch.parse.parse_args()

        user_gr = params['user_gr'].split(",")
        # user_gr.split에서 tuple을 제대로 인식못해서 잠시 롤백
        # user_list = json.dumps([dict(r) for r in UserModel.get_user_code(user_gr)], default=jsonEncoder)
        try:
            guser = current_user.user_id
            if current_user.is_authenticated():
                guser = current_user.user_id
        except Exception as e:
            return 200

        

        user_list = UserModel.get_user_code(user_gr)
        sum_user_settop = 0
        sum_user_disk = 0

        if current_user.user_gr == "0102":
            sum_user_disk = [dict(r) for r in UserModel.get_sum_user_disk(guser)][0]['sum_disk']
            sum_user_settop = str([dict(r) for r in UserModel.get_sum_user_settop(guser)][0]['sum_settop'])

        final_list = [{
            'user_id': row[0],
            'user_nm': row[1],
            'user_gr_nm': row[2],
        } for row in user_list]

        user_list = json.dumps(final_list, cls=jsonEncoder)
        
        ret_value = {
                     "resultCode": "0",
                     "resultString": "SUCCESS",
                     "resultUserid":  guser,
                     "resultUserGroup": current_user.user_gr,
                     "data": user_list
        }

        return ret_value, 200

    def post(self):
        res_data = {}

        params = UserSearch.parse.parse_args()
        user_id = params['user_id']
        user_nm = params['user_nm']
        user_gr = params['user_gr']
        group_seq = params['group_seq']
        start = params['start']
        length = params['length']

        print(params)
        # if(current_user.user_gr == '0103'): #담당자인 경우
        #     group_seq = int(current_user.group_seq)
        #     create_user_id = current_user.user_id
        # else:
        #     group_seq = 0 #어드민인 경우
        #     create_user_id = current_user.user_id
        
        # 사용자 Total Count
        param = (user_id, user_nm, user_gr, group_seq)
        tot_list = [dict(r) for r in UserModel.find_all_user_count(param)]

        res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        res_data['recordsFiltered'] = tot_list[0]['tot_cnt']

        ###################################################################

        # 페이징 데이터 조회 처리
        if(length == None):
            length = "0" 
        param = (user_id, user_nm, user_gr, group_seq, start, length)

        res_data['data'] = [dict(r) for r in UserModel.find_all_user(param)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"


        return res_data, 200




class UserDormancy(Resource):
    parse = reqparse.RequestParser()

    # print("Request comes here..")


    def put(self, user_id):
        # print(user_id)
        try:
            user_obj = UserModel.find_by_id(user_id)

            # 휴면 해지 코드 삽입 예정 (ARNOLD UPDATE)
            user_obj.user_dor_acc = 'N'
            user_obj.modify_date = datetime.now()

            user_obj.save_to_db()

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": user_id + " 계정의 휴면 상태 해지에 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": user_id + " 계정의 휴면 상태가 해제되었습니다."}, 200


class UserPassword(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('user_pwd', type=str)

    def put(self, user_id):

        params = UserPassword.parse.parse_args()
        user_pwd = params['user_pwd']

        # print("ID:"+user_id+" PWD:"+user_pwd)


        try:
            user_obj = UserModel.find_by_id(user_id)
            user_obj.set_password(user_pwd)
            print("!@#$user_obj")
            print(user_obj)
            user_obj.user_pwd_change_dt = datetime.now()
            user_obj.modify_date = datetime.now()
            print("!@#$user_obj")
            print(user_obj)
            user_obj.save_to_db()

        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": user_id + " 계정의 패스워드 변경이 실패하였습니다."}, 500

        return {'resultCode': '0', "resultString": user_id + " 계정의 패스워드 변경이 성공하였습니다."}, 200

class UserDuplicate(Resource):
    parse = reqparse.RequestParser()
    print('들어옴')

    def get(self, user_id):
        user_obj = UserModel.find_by_id(user_id)
        if user_obj:
            return {'result': True}
        else:
            return {'result': False}