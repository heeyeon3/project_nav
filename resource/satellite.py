from flask_restful import Resource, reqparse, request
from datetime import datetime, timedelta
from flask import jsonify

import json
import cv2
from models.station import stationModel
from sqlalchemy.sql.elements import Null
from sqlalchemy.sql.functions import current_time, current_timestamp
from werkzeug.exceptions import PreconditionRequired
from config.properties import *
from utils.jsonutil import AlchemyEncoder as jsonEncoder
from utils.fileutil import FileUtils
import logging
import time

import re
from models.satellite import *


class satellite(Resource):

    parse = reqparse.RequestParser()

    parse.add_argument('station_id', type=str)

    def get(self):

        result_string = {}

        station_id =              request.args.get('station_id')

        result_string = json.dumps(satelliteModel.find_by_id_all(station_id), cls=jsonEncoder)

        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200


    def post(self):
        
        print("UserRegister POST ..")

        jsonData = request.get_json()

        # 사용자 등록

        
        station_id =                   jsonData['station_id']
        satellite_base =               jsonData['satellite_base']           
        satellite_mon =                jsonData['satellite_mon']           
        satellite_year =               jsonData['satellite_year']           
        satellite_month =              jsonData['satellite_month']           
        satellite_day =                jsonData['satellite_day']           
        satellite_hour =               jsonData['satellite_hour']           
        satellite_min =                jsonData['satellite_min']           
        satellite_sec =                jsonData['satellite_sec']           
        satellite_gnssno =             jsonData['satellite_gnssno']           
        satellite_gnsstyle =           jsonData['satellite_gnsstyle']           
        satellite_svno =               jsonData['satellite_svno']           
        satellite_elevation =          jsonData['satellite_elevation']           
        satellite_azimuth =            jsonData['satellite_azimuth']           
        satellite_L1 =                 jsonData['satellite_L1']           
        satellite_L2 =                 jsonData['satellite_L2']           
    
               


        try:
            satellite_obj = satelliteModel(station_id, satellite_base, satellite_mon, satellite_year, satellite_month, satellite_day, satellite_hour, satellite_min, 
                                             satellite_sec, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, satellite_azimuth, satellite_L1, satellite_L2)
            
            satellite_obj.save_to_db()

        except Exception as e:

            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 500


        return {'resultCode': '0', "resultString": "등록 되었습니다."}, 200

class station_satellite_monitoring(Resource):

    parse = reqparse.RequestParser()
    parse.add_argument('station_id', type=str)
    parse.add_argument('startdate', type=str)
    parse.add_argument('enddate', type=str)
    parse.add_argument('ratedate', type=str)
    parse.add_argument('gnsstype', type=str)
    parse.add_argument('satellitetype', type=str)

    def get(self):
        datetimenow = datetime.now()
        datetimenow_1 = datetimenow - timedelta(minutes=1)
        datetimenow_1 = str(datetimenow_1)

        result_string = {}
        station_id =              request.args.get('station_id')

        stationid_list = [dict(r) for r in stationModel.station_list()]
        print(stationid_list)
        station_id_list=[]

        for i in range(len(stationid_list)):
            station_id_list.append(stationid_list[i]['station_id'])



        try:
            #sql injection
            if station_id not in station_id_list:
                return {'resultCode': '100', "resultString": "FAIL"}, 400
         
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400



        print(datetime.now())
        now = datetime.now()
        nowDatetime = now.strftime('%Y-%m-%d %H:%M:%S')
        print(nowDatetime) 
        param=(station_id, nowDatetime, datetimenow_1)
        result_string = [dict(r) for r in satelliteModel.current_satellite_data(param)]

        return {'resultCode': '0', "resultString": "SUCCESS", "data":result_string}, 200
    


    def post(self):

        print("QW")
        params = station_satellite_monitoring.parse.parse_args()

        station_id =                   params['station_id']
        startdate =                    params['startdate']
        enddate =                      params['enddate']
        ratedate =                     params['ratedate']

        gnsstype =                     params['gnsstype']
        satellitetype =                params['satellitetype']
 
        stationid_list = [dict(r) for r in stationModel.station_list()]
        print(stationid_list)
        station_id_list=[]

        for i in range(len(stationid_list)):
            station_id_list.append(stationid_list[i]['station_id'])

        test = '[\=\!\#\$\%\^\&\*\(\)\_\+\<\>\/\\\[\]]'
        result_project = ''

        if gnsstype is not None :
            result_project = re.findall(test, gnsstype)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if satellitetype is not None :
            result_project = re.findall(test, satellitetype)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if startdate is not None :
            result_project = re.findall(test, startdate)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        if enddate is not None :
            result_project = re.findall(test, enddate)
            if len(result_project) > 0 : 
                return {'resultCode': '100', "resultString": "FAIL"}, 400

        

        try:
            #sql injection
            if len(startdate) !=10 or len(enddate) != 10:
                return {'resultCode': '100', "resultString": "FAIL"}, 400

            if station_id not in station_id_list:
                return {'resultCode': '100', "resultString": "FAIL"}, 400

            if ratedate and len(ratedate) > 0 :
                int(ratedate)

            
        
        except Exception as e:
            logging.fatal(e, exc_info=True)
            return {'resultCode': '100', "resultString": "FAIL"}, 400

        param = (station_id, startdate, enddate, ratedate, gnsstype, satellitetype)
        select_data = [dict(r) for r in satelliteModel.find_by_id_satedata(param)]

        # param = (station_id, startdate, enddate, ratedate, gnsstype, satellitetype)
        # print("12123",param)
        
        # resultString = [dict(r) for r in satelliteModel.find_by_id_satedata(param)]
        

        return {'resultCode': '0', "resultString": "SUCCESS", "data":select_data}, 200
   

        