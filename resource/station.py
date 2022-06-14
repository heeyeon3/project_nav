from os import path
from flask_restful import Resource, reqparse, request
from datetime import datetime
from flask import jsonify

import json
import cv2
from sqlalchemy.sql.elements import Null
from sqlalchemy.sql.expression import null
from sqlalchemy.sql.type_api import NULLTYPE
from werkzeug.exceptions import PreconditionRequired
from config.properties import *
from resource.project import project
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
import logging
import time
from flask_login import current_user

from models.station import *
from models.location_station import *
from models.user import UserModel

import re

class station(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('station_seq', type=str)
    parse.add_argument('project_id', type=str)
    parse.add_argument('location_id_1', type=str)  #변경전 로케이션 아이디
    parse.add_argument('location_id', type=str)
    parse.add_argument('station_id', type=str)
    parse.add_argument('station_name', type=str)
    parse.add_argument('station_ipAddress', type=str)
    parse.add_argument('station_udp1', type=str)
    parse.add_argument('station_udp2', type=str)
    parse.add_argument('station_udp3', type=str)
    parse.add_argument('current_user_id', type=str)
    parse.add_argument('use_yn', type=str)
  
  

    def get(self):

        result_string = {}

        location_id =              request.args.get('location_id')

        result_string = json.dumps(stationModel.find_by_id_all(location_id), cls=jsonEncoder)

        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200


    def post(self):
        
        print("UserRegister POST ..")

        params = station.parse.parse_args()


        # 사용자 등록

        project_id =                   params['project_id']
        location_id =                  params['location_id']
        station_id =                   params['station_id']
        station_name =                 params['station_name']
        station_ipAddress =            params['station_ipAddress']
        station_udp1 =                 params['station_udp1']           
        station_udp2 =                 params['station_udp2']           
        station_udp3 =                 params['station_udp3']           
        current_user_id =              current_user.user_id          
            
        station_obj_name =  stationModel.find_by_name(station_name) 

        create_date = datetime.now()
        modify_date = datetime.now()  

        print(station_name)
        
           
        station_obj_id =  stationModel.find_by_id(station_id)    
        if(len(station_ipAddress)==0):
            station_ipAddress = None
        if(len(station_udp1)==0):
            station_udp1 = None
        if(len(station_udp2)==0):
            station_udp2 = None
        if(len(station_udp3)==0):
            station_udp3 = None

        if(station_obj_name):
            return {'resultCode': '100', "resultString": "스테이션 이름이 중복되었습니다."}, 200
            
            
        elif(station_obj_id):
            return {'resultCode': '100', "resultString": "스테이션 아이디가 중복되었습니다."}, 200
        else:
            
            try:
                station_obj = stationModel(station_id, station_name, station_ipAddress,station_udp1, station_udp2, station_udp3, 'Y', current_user_id, create_date, modify_date)
                station_obj.save_to_db()

                station_seq = stationModel.find_by_id(station_id).station_seq
            
                
                location_station_obj = LocationStationModel(location_id, station_seq,'Y',create_date, modify_date )
                
                location_station_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": "등록 되었습니다."}, 200

    def put(self):
        params = station.parse.parse_args()

    
       
        location_id =                  params['location_id']
        location_id_1 =                params['location_id_1'] #변경전 로케이션 아이디
        station_id =                   params['station_id']
        station_name =                 params['station_name']
        station_ipAddress =            params['station_ipAddress']
        station_udp1 =                 params['station_udp1']           
        station_udp2 =                 params['station_udp2']           
        station_udp3 =                 params['station_udp3']           
        use_yn =                       params['use_yn']     
        station_seq =                  params['station_seq']        
        print(params)
        try:
            #sql injection
            if location_id and len(location_id) > 0 :
                int(location_id)

            if location_id_1 and len(location_id_1) > 0 :
                int(location_id_1)

            if station_udp1 and len(station_udp1) > 0 :
                int(station_udp1)

            if station_udp2 and len(station_udp2) > 0 :
                int(station_udp2)

            if station_udp3 and len(station_udp3) > 0 :
                int(station_udp3)

            if station_seq and len(station_seq) > 0 :
                int(station_seq)
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        if station_id is not None :
            result_project = re.findall(test, station_id)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if station_name is not None :
            result_project = re.findall(test, station_name)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if station_ipAddress is not None :
            result_project = re.findall(test, station_ipAddress)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if use_yn is not None and use_yn != "Y" and use_yn != "N":
            return {'resultCode': '100', "resultString": "FAIL"}, 400


        print("CHECK PROJECT ", result_project)

        if len(result_project) > 0 : 
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        
        print("1212121212",params)

        if(station_ipAddress and len(station_ipAddress)==0):
            station_ipAddress = None
        if(station_udp1 and len(station_udp1)==0):
            station_udp1 = None
        if(station_udp2 and len(station_udp2)==0):
            station_udp2 = None
        if(station_udp3 and len(station_udp3)==0):
            station_udp3 = None

        if(station_seq):
            station_obj = stationModel.find_by_seq(station_seq)
            station_seq = station_obj.station_seq
            station_location_obj = LocationStationModel.find_by_id(location_id_1, station_seq)
        
        if(use_yn == 'N'):
            station_obj_by_id = stationModel.find_by_id(station_id) #삭제시 쓰이는 데이터
            station_seq = station_obj_by_id.station_seq            
            station_location_obj = LocationStationModel.find_by_id(location_id, station_seq)

            print("!@3123345")
            station_location_obj.use_yn = use_yn

            try:
                station_obj_by_id.modify_date = datetime.now()
                station_obj_by_id.use_yn = use_yn
                station_location_obj.modify_date = datetime.now()

                station_obj_by_id.save_to_db()
                station_location_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 삭제 되었습니다."}, 200
        
        
        if(station_obj):
            station_name_dup = [dict(r) for r in stationModel.find_by_USE_name(station_name)]
            station_id_dup = [dict(r) for r in stationModel.find_by_USE_id(station_id)]
  
            
            if(station_name_dup and station_name_dup[0]["station_name"] == station_name and station_name_dup[0]["station_seq"] != station_seq):
                return {'resultCode': '100', "resultString": "스테이션 이름이 중복되었습니다."}, 200

            elif(station_id_dup and station_id_dup[0]["station_id"] == station_id and station_id_dup[0]["station_seq"] != station_seq):
                return {'resultCode': '100', "resultString": "스테이션 아이디가 중복되었습니다."}, 200

            
            else:    
                station_location_obj.location_id = location_id    
                station_obj.station_id = station_id           
                station_obj.station_name = station_name            
                station_obj.station_ipAddress = station_ipAddress            
                station_obj.station_udp1 = station_udp1            
                station_obj.station_udp2 = station_udp2            
                station_obj.station_udp3 = station_udp3            
                                  
        
            try:
                    station_obj.modify_date = datetime.now()
                    station_location_obj.modify_date = datetime.now()
                    station_obj.save_to_db()

            except Exception as e:

                logging.fatal(e, exc_info=True)
                return {'resultCode': '100', "resultString": "FAIL"}, 500


            return {'resultCode': '0', "resultString": " 수정 되었습니다."}, 200

class stationlist(Resource):
    parse = reqparse.RequestParser()
    parse.add_argument('station_id', type=str)
    parse.add_argument('station_name', type=str)
    parse.add_argument('project_id', type=str)
    parse.add_argument('project_name', type=str)
    parse.add_argument('location_name', type=str)
    parse.add_argument('station_ipAddress', type=str)

    # def get(self):

    #     result_string = {}

    #     project_id =              request.args.get('project_id')

    #     result_string = [dict(r) for r in stationModel.stationlist(project_id)]
        
    #     return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200

    # station data 보여주기
    def post(self):

        params = stationlist.parse.parse_args()

        print(params)

        # 스테이션 리스트

        station_id =                        params['station_id']
        station_name =                      params['station_name']
        project_name =                      params['project_name']
        location_name =                     params['location_name']
        station_ipAddress =                 params['station_ipAddress']
       
        # start = params['start']
        # length = params['length']

        user_id =                       current_user.user_id
        user_obj =                      UserModel.find_by_id(user_id)
        
        project_id =                  user_obj.project_id

        print("CHECK PROJECT ", station_id, station_name, project_name, location_name, station_ipAddress)

        test = '[\'\"\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        if station_id is not None :
            result_project = re.findall(test, station_id)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if station_name is not None :
            result_project = re.findall(test, station_name)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if project_name is not None :
            result_project = re.findall(test, project_name)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if location_name is not None :
            result_project = re.findall(test, location_name)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if station_ipAddress is not None :
            result_project = re.findall(test, station_ipAddress)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        print("CHECK PROJECT ", result_project)

        if len(result_project) > 0 : 
            return {'resultCode': '100', "resultString": "FAIL"}, 400


        param = (station_id, station_name, project_name, location_name, station_ipAddress, project_id)
        
        res_data = {}
        
        res_data['data'] = [dict(r) for r in stationModel.stationsearch(param)]


        # 응답 결과
        res_data['resultCode'] = "0"
        res_data['resultString'] = "SUCCESS"

        return res_data, 200


# 수정 버튼 클릭시 데이터 가져오기
class station_Edit_button(Resource):
    
    parse = reqparse.RequestParser()
    parse.add_argument('station_id', type=str)

    def get(self):

        
        result_string = {}
        station_id =              request.args.get('station_id')


        stationid_list = [dict(r) for r in stationModel.station_list()]
        print(stationid_list)
        station_id_list=[]

        for i in range(len(stationid_list)):
            station_id_list.append(stationid_list[i]['station_id'])

        #sql injection

        if station_id not in station_id_list:
            return {'resultCode': '100', "resultString": "FAIL"}, 400
            # int(project_id)

        print(station_id)
     
        result_string = [dict(r) for r in stationModel.find_by_id_edit(station_id)]
        print(result_string)
        


        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200


# 모니터링 데이터
class location_station_list(Resource):
    
    parse = reqparse.RequestParser()
    parse.add_argument('location_id', type=str)

    def get(self):

        result_string = {}
        location_id =              request.args.get('location_id')
        result_string = [dict(r) for r in stationModel.monitoring_lo_st(location_id)]

    
        


        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200

class find_user_project(Resource):

    parse = reqparse.RequestParser()
    parse.add_argument('project_id', type=str)
    parse.add_argument('status', type=str)

    def get(self):

        status = request.args.get('status')
        
        if status != "1000" :
            return {'resultCode': '100', "resultString": "FAIL"}, 400  

        result_string = {}
        print(current_user.user_id)
        
        result_string = [dict(r) for r in stationModel.find_project_user(current_user.user_id)]
        print("result_string", result_string)

        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200