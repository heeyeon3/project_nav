from telnetlib import STATUS
from flask_restful import Resource, reqparse, request
from datetime import datetime, timedelta
from flask import jsonify

import json
import cv2
from sqlalchemy.sql.elements import Null
from werkzeug.exceptions import PreconditionRequired
from config.properties import *
from models.location import locationModel
from models.station import stationModel
from models.location_station import LocationStationModel
from models.user import UserModel
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
import logging
import time
from flask_login import current_user
import requests
# from requests import get 
from flask import send_from_directory

from models.project import *

import re

class project(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('project_id', type=str)
    parse.add_argument('project_name', type=str)
    parse.add_argument('project_description', type=str)
    parse.add_argument('project_company', type=str)
    parse.add_argument('use_yn', type=str)

    # def get(self):

    #     result_string = {}

    #     user_id =              request.args.get('user_id')

    #     result_string = json.dumps(projectModel.find_by_id_all(user_id), cls=jsonEncoder)

    #     return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200


    def post(self):
        
        print("UserRegister POST ..")

        params = project.parse.parse_args()

        # 프로젝트 등록
        project_name =                 params['project_name']
        project_description =          params['project_description']
        project_company =              params['project_company']
        use_yn =                       params['use_yn']
        current_user_id =              current_user.user_id      

        create_date = datetime.now()
        modify_date = datetime.now()     
                

        project_obj = [dict(r) for r in projectModel.find_by_USE_id(project_name)]
        print(project_obj)
        if(project_obj ==[]):


            try:
                project_obj1 = projectModel(project_name, project_description, project_company, use_yn, current_user_id, create_date, modify_date )
                project_obj1.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 등록 되었습니다."}, 200

        else:
            return {'resultCode': '100', "resultString": "프로젝트 이름이 중복되었습니다."}, 200

    def put(self):
        params = project.parse.parse_args()

        # 프로젝트 수정
        project_id =                   params['project_id']
        project_name =                 params['project_name']
        project_description =          params['project_description']
        project_company =              params['project_company']
        use_yn =                       params['use_yn'] 


        try:
            #sql injection
            if project_id and len(project_id) > 0 :
                int(project_id)
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        project_obj = projectModel.find_by_id(project_id)

        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        if project_name is not None :
            result_project = re.findall(test, project_name)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if project_description is not None :
            result_project = re.findall(test, project_description)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if project_company is not None :
            result_project = re.findall(test, project_company)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if use_yn != "Y" and use_yn != "N" :
            return {'resultCode': '100', "resultString": "FAIL"}, 400
       
        print("CHECK PROJECT ", result_project)

        

        if(project_obj and use_yn == 'N') :
            
            location_list = [dict(r) for r in locationModel.del_location_list(project_id)]
            if(location_list):
                for i in range(len(location_list)):
                    location_obj = locationModel.find_by_project_id(location_list[i]['project_id'])
        
                    location_obj.use_yn = 'N'
                    location_obj.modify_date = datetime.now()
                    location_obj.save_to_db()

                    station_location_list = [dict(r) for r in locationModel.del_location_station_list(location_list[i]['location_id'])]

                    for j in range(len(station_location_list)):

                        station_location_obj = LocationStationModel.find_by_id(location_list[i]['location_id'], station_location_list[j]['station_seq'])
                        station_location_obj.use_yn = 'N'
                        station_location_obj.modify_date = datetime.now()
                        station_location_obj.save_to_db()

                        station_seq = station_location_list[j]['station_seq']
                        station_obj = stationModel.find_by_seq(station_seq)
                        station_obj.use_yn = 'N'
                        station_obj.modify_date = datetime.now()
                        station_obj.save_to_db()
                        
            project_obj.use_yn = use_yn

            try:
                project_obj.modify_date = datetime.now()
                project_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 삭제 되었습니다."}, 200
        
        elif(project_obj and use_yn == 'Y'):
            project_name_dup = [dict(r) for r in projectModel.find_by_USE_id(project_name)]
            
            if(project_name_dup and project_name_dup[0]["project_id"] != int(project_id)  and project_name_dup[0]["project_name"] == project_name):
                return {'resultCode': '100', "resultString": "프로젝트 이름이 중복되었습니다."}, 200

            else:
                project_obj.project_name = project_name            
                project_obj.project_description = project_description            
                project_obj.project_company = project_company                      
        
                try:
                        project_obj.modify_date = datetime.now()
                        project_obj.save_to_db()

                except Exception as e:

                    logging.fatal(e, exc_info=True)
                    return {'resultCode': '100', "resultString": "FAIL"}, 500


                return {'resultCode': '0', "resultString": " 수정 되었습니다."}, 200

        

                    

        
   

class projectDuplicate(Resource):
    parse = reqparse.RequestParser()

    def get(self, project_name):
        project_obj = [dict(r) for r in projectModel.find_by_USE_id(project_name)]
    
        if project_obj:
            return {'result': True}
        else:
            return {'result': False}      


class projectlist(Resource):
    parse = reqparse.RequestParser()

    parse.add_argument('project_id', type=str)
    parse.add_argument('project_name', type=str)
    parse.add_argument('project_description', type=str)
    parse.add_argument('project_company', type=str)
    parse.add_argument('use_yn', type=str)

    parse.add_argument('start', type=int)
    parse.add_argument('length', type=int)

    parse.add_argument('status', type=str)

    def get(self):

        status = request.args.get('status')
        
        if status != "1000" :
            return {'resultCode': '100', "resultString": "FAIL"}, 400  

        current_user_id = current_user.user_id 
        user_obj = UserModel.find_by_id(current_user_id)
        user_gr = user_obj.user_gr
        project_id = user_obj.project_id
        if(user_gr =='0103' or user_gr== '0104'):
            result_string = [dict(r) for r in projectModel.projectlist_usergr(project_id)]
        else:
            result_string = [dict(r) for r in projectModel.projectlist()]
        
        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200
    
    ### project data 생성
    def post(self):

        params = project.parse.parse_args()

     

        # 사용자 리스트
        
        project_name =                 params['project_name']
        project_description =          params['project_description']
        project_company =              params['project_company']

        # start = params['start']
        # length = params['length']
        
        print("CHECK PROJECT ", project_name, project_description, project_company)

        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        if project_name is not None :
            result_project = re.findall(test, project_name)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if project_description is not None :
            result_project = re.findall(test, project_description)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if project_company is not None :
            result_project = re.findall(test, project_company)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        print("CHECK PROJECT ", result_project)

        if len(result_project) > 0 : 
            return {'resultCode': '100', "resultString": "FAIL"}, 400
        
        param = (project_name, project_description, project_company)
        res_data = {}
        # tot_list = [dict(r) for r in projectModel.project_count()]
        # res_data['recordsTotal'] = tot_list[0]['tot_cnt']
        # res_data['recordsFiltered'] = tot_list[0]['tot_cnt']
        # print(res_data)
        ###################################################################
        # param = (start, length)



        res_data['data'] = [dict(r) for r in projectModel.projectsearch(param)]

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"

        return res_data, 200

# 수정 버튼 클릭시 데이터 가져오기
class project_Edit_button(Resource):
    
    parse = reqparse.RequestParser()
    parse.add_argument('project_id', type=str)

    def get(self):
       
        result_string = {}
        project_id =              request.args.get('project_id')
        
        try:
            #sql injection
            if project_id and len(project_id) > 0 :
                int(project_id)
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400


       
        result_string = json.dumps(projectModel.find_by_id(project_id), cls=jsonEncoder)


        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200



#manual down
class manual(Resource):
    
    parse = reqparse.RequestParser()
    parse.add_argument('project_id', type=str)

    def get(self):
       
        result_string = {}
        project_id =              request.args.get('project_id')
        print(common_url)

        file_name = "Manual_NetVu_V1.0_Rev2.pdf"
       
        dls = common_url+file_name
        url = common_url
       
        # with open(file_name, "wb") as file:
        #     response = requests.get(url)
        #     file.write(response.content)
        print(file_name)  
        resp = requests.get(dls)
        print("1")
        # output = open(common_file+file_name, "wb")
        with open(common_file+file_name, 'wb')as file:
            file.write(resp.content)
        print("2")
        
        
        send_from_directory(common_file, file_name)
        print("3")
        filename =  common_url+file_name
        print(filename)

        # with open(filename, "wb") as file: 
        #     response = get(filename)
        #     file.write(response.content)


        # dls = excel_url+file_name
        # resp = requests.get(dls)
        # output = open(excel_file+file_name, 'rb')
        # send_from_directory(excel_file, file_name)
        # filename = excel_url + file_name




        return {'resultCode': '0', "resultString": "SUCCESS" ,"url": filename}, 200