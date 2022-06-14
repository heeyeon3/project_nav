
from flask_login import current_user
from flask_restful import Resource, reqparse, request
from models.log import LogModel
import logging


class LogMessage:

    str_format = {

        "msg_insert": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message}을 등록 하였습니다.",
        "msg_update": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message}을 수정 하였습니다.",
        "msg_delete": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message}을 삭제 하였습니다.",
        "msg_login": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message}에 로그인 하였습니다.",
        "msg_login_fail": "USER-ID: {user_id} 님이 {message}에 로그인에 실패 하였습니다.",
        "msg_logout": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message}에 로그아웃 하였습니다.",
        "msg_upload": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message} 파일을 업로드 하였습니다.",
        "msg_download": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message}을 다운로드 하였습니다.",
        "msg_dummy": "USER-ID: {user_id}, USER-NM: {user_nm} 님이 {message}",
    }

    @staticmethod
    def set_message(key, message, menu):

        msg_key = LogMessage.str_format[key]

        user_id = current_user.user_id
        user_nm = current_user.user_nm
        user_gr = current_user.user_gr

        # 시스템 매니저인 경우는 return
        if user_gr == "0101":
            return True

        msg = msg_key.format(user_id=user_id, user_nm=user_nm, message=message)

        try:

            log_obj = LogModel(user_id, msg, menu)
            log_obj.save_to_db()
            print(user_id + " msg >> " + msg)
        except Exception as e:

            logging.fatal(e, exc_info=True)
            return False

        return True

    @staticmethod
    def set_login_fail_message(key, message, user_id, menu):

        msg_key = LogMessage.str_format[key]

        # 로그인 실패시 사용됨
        msg = msg_key.format(user_id=user_id, message=message)

        try:

            log_obj = LogModel(user_id, msg, menu)
            log_obj.save_to_db()
            print(user_id + " msg >> " + msg)
        except Exception as e:

            logging.fatal(e, exc_info=True)
            return False

        return True




