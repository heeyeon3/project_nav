from venv import create
from flask_restful import Resource, reqparse, request
from datetime import datetime
from flask import jsonify

import json
import cv2
from sqlalchemy.sql.elements import Null
from sqlalchemy.sql.functions import current_user
from werkzeug.exceptions import PreconditionRequired
from config.properties import *
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
import logging
import time
from flask_login import current_user

from models.location import *
from models.user import *
from models.station import stationModel
from models.location_station import LocationStationModel

import re

class location(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('location_id', type=str)
    parse.add_argument('location_name', type=str)
    parse.add_argument('location_description', type=str)
    parse.add_argument('use_yn', type=str)
    parse.add_argument('project_id', type=str)

    # def get(self):

    #     result_string = {}

    #     project_id =              request.args.get('project_id')
      

    #     result_string = json.dumps(locationModel.find_by_id_all(project_id), cls=jsonEncoder)

    #     return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200


    def post(self):
        
        print("UserRegister POST ..")

        params = location.parse.parse_args()

        # 로케이션 등록
        location_name =                 params['location_name']
        location_description =          params['location_description']
        use_yn =                        params['use_yn']
        current_user_id =               current_user.user_id      
        project_id =                    params['project_id']           
                
        location_obj = [dict(r) for r in locationModel.find_by_USE_id(location_name)]

        create_date = datetime.now()
        modify_date = datetime.now()
       

        if(location_obj ==[]):


            try:
                location_obj1 = locationModel(location_name, location_description, use_yn, current_user_id, project_id, create_date, modify_date)
                
                location_obj1.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 등록 되었습니다."}, 200

        else:
            return {'resultCode': '100', "resultString": "로케이션 이름이 중복되었습니다."}, 200

    def put(self):
        params = location.parse.parse_args()


        # 로케이션 수정
        location_id =                   params['location_id']
        location_name =                 params['location_name']
        location_description =          params['location_description']
        project_id =                    params['project_id']
        use_yn =                        params['use_yn'] 
        project_id =                    params['project_id'] 

        print(location_id)
        try:
            #sql injection
            if location_id and len(location_id) > 0 :
                int(location_id)
            
            if project_id and len(project_id) > 0 :
                int(project_id)
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_location = ''

        if location_id is not None :
            result_location = re.findall(test, location_id)
            if len(result_location) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if location_name is not None :
            result_location = re.findall(test, location_name)
            if len(result_location) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if location_description is not None :
            result_location = re.findall(test, location_description)
            if len(result_location) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if use_yn != "Y" and use_yn != "N" :
            
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        print("CHECK LOCATION ", result_location)

        if len(result_location) > 0 : 
            return {'resultCode': '100', "resultString": "FAIL"}, 400


        location_obj = locationModel.find_by_id(location_id)
     

        if(location_obj and use_yn == 'N') :
            location_obj.use_yn = use_yn

            station_location_list = [dict(r) for r in locationModel.del_location_station_list(location_id)]

            for j in range(len(station_location_list)):

                station_location_obj = LocationStationModel.find_by_id(location_id, station_location_list[j]['station_seq'])
                station_location_obj.use_yn = 'N'
                station_location_obj.modify_date = datetime.now()
                station_location_obj.save_to_db()

                station_seq = station_location_list[j]['station_seq']
                station_obj = stationModel.find_by_seq(station_seq)
                station_obj.use_yn = 'N'
                station_obj.modify_date = datetime.now()
                station_obj.save_to_db()

            try:
                location_obj.modify_date = datetime.now()
                location_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 삭제 되었습니다."}, 200
        
        elif(location_obj and use_yn == 'Y'):
            location_name_dup = [dict(r) for r in locationModel.find_by_USE_id(location_name)]
          
            if(location_name_dup and location_name_dup[0]["location_name"] == location_name and location_name_dup[0]["location_id"] != int(location_id)):
                return {'resultCode': '100', "resultString": "로케이션 이름이 중복되었습니다."}, 200

            else:
                location_obj.location_name = location_name            
                location_obj.location_description = location_description            
                location_obj.project_id = project_id            
                                  
        
            try:
                    location_obj.modify_date = datetime.now()
                    location_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 수정 되었습니다."}, 200
        


class locationlist(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('location_id', type=str)
    parse.add_argument('location_name', type=str)
    parse.add_argument('project_id', type=str)
    parse.add_argument('project_name', type=str)
    parse.add_argument('user_gr', type=str)

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


        result_string = [dict(r) for r in locationModel.locationlist(project_id)]
      
        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200

    # location data 보여주기
    def post(self):

        params = locationlist.parse.parse_args()

  

        # 사용자 등록

        location_id =                   params['location_id']
        location_name =                 params['location_name']
        project_name =                  params['project_name']
        
        print("CHECK PROJECT ", location_id, location_name, project_name)

        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_location = ''

        try:
            #sql injection
            if location_id and len(location_id) > 0 :
                int(location_id)
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        if location_id is not None :
            result_location = re.findall(test, location_id)
            if len(result_location) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if location_name is not None :
            result_location = re.findall(test, location_name)
            if len(result_location) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if project_name is not None :
            result_location = re.findall(test, project_name)
            if len(result_location) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        print("CHECK LOCATION ", result_location)

        if len(result_location) > 0 : 
            return {'resultCode': '100', "resultString": "FAIL"}, 400
        
        user_id =                       current_user.user_id

        user_obj =                      UserModel.find_by_id(user_id)
        
        project_id =                  user_obj.project_id
        # user_gr =                    user_obj.user_gr

        # print(project_id,"///")
        param = (location_id, location_name, project_name, project_id)
        res_data = {}
        
        res_data['data'] = [dict(r) for r in locationModel.locationsearch(param)]
       

        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"

        return res_data, 200

    

# 수정 버튼 클릭시 데이터 가져오기
class location_Edit_button(Resource):
    
    parse = reqparse.RequestParser()
    parse.add_argument('location_id', type=str)

    def get(self):

        result_string = {}
        location_id =              request.args.get('location_id')

        try:
            #sql injection
            if location_id and len(location_id) > 0 :
                int(location_id)
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400


        result_string = json.dumps(locationModel.find_by_id(location_id), cls=jsonEncoder)


        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200

        