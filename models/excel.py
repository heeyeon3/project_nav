from datetime import datetime
from core.db import db
from sqlalchemy.sql import text
## excel_cd = 0100 일반 사용자 등급
## excel_cd = 0101 Project Manager 등급
## excel_cd = 0102 Program Manager 등급



class ExcelModel(db.Model):
    __tablename__ = 'tbl_excel'

    excel_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)                 # 공통코드
    excel_request = db.Column(db.String(100), nullable=False)                      # 공통코드명
    excel_status = db.Column(db.String(100), nullable=True)                      # 공통코드 코멘트(색상인 경우 코드표 들어감)
    excel_url = db.Column(db.String(200), nullable=True)                      # 공통코드 코멘트(색상인 경우 코드표 들어감)
    user_id = db.Column(db.String(30), nullable=True)                      # 공통코드 코멘트(색상인 경우 코드표 들어감)
   
    create_date = db.Column(db.DateTime, default=datetime.now())
    modify_date = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, excel_request, excel_status, excel_url, user_id, create_date, modify_date):

        self.excel_request = excel_request
        self.excel_status = excel_status
        self.excel_url = excel_url
        self.user_id = user_id
        self.create_date = create_date
        self.modify_date = modify_date


    @classmethod
    def find_by_id(cls, excel_id):
        return cls.query.filter_by(excel_id=excel_id).first()

    @classmethod
    def find_by_user_id(cls, user_id, excel_request):

        sql = """select excel_id, user_id, excel_request from tbl_excel where user_id = '"""+user_id+"""' and excel_request = '"""+excel_request+"""'
                    order by create_date desc limit 1;"""
        return db.engine.execute(text(sql))

    @classmethod
    def get_excel_list(cls):
        return cls.query.all()

    

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def get_apply_code(cls, excel_up_cd):
        return cls.query.filter_by(excel_up_cd=excel_up_cd).all()
