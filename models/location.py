from datetime import datetime

from sqlalchemy.sql.functions import user
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func


class locationModel(db.Model):
    __tablename__ = 'tbl_location'

    location_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)     # 로케이션 아이디 
    location_name = db.Column(db.String(50), nullable=False)                         # 로케이션 네임
    location_description = db.Column(db.String, nullable=False)                 # 로케이션 상세 정보
    use_yn = db.Column(db.String(1), nullable = False, default = 'Y')                # 사용 여부
    current_user_id = db.Column(db.String(50), nullable=False)                               # 사용자 아이디
    project_id = db.Column(db.BigInteger, nullable=False)                            # 프로젝트 아이디

    create_date = db.Column(db.DateTime)                     # 생성 일시
    modify_date = db.Column(db.DateTime)                     # 수정 일시

    def __init__(self, location_name, location_description, use_yn, current_user_id, project_id, create_date, modify_date):

        self.location_name = location_name
        self.location_description = location_description
        self.use_yn = use_yn
        self.current_user_id = current_user_id
        self.project_id = project_id
        self.create_date = create_date
        self.modify_date = modify_date

    @classmethod
    def find_by_id(cls, location_id):
        return cls.query.filter_by(location_id=location_id).first()

    @classmethod
    def find_by_id_all(cls, project_id):
        return cls.query.filter_by(project_id=project_id).all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def locationlist(cls, project_id):
        sql = """select location_id, location_name 
                from tbl_location 
                where use_yn = 'Y' and project_id = :project_id;"""
        return db.engine.execute(text(sql),{'project_id':project_id})

    @classmethod
    def all_location_list(cls):
        sql = '''
            SELECT distinct location_id FROM tbl_location
            where use_yn = "Y";
        '''
        return db.engine.execute(text(sql))

    @classmethod
    def find_by_project_id(cls, project_id):
        return cls.query.filter_by(project_id=project_id, use_yn='Y').first()

    @classmethod
    def del_location_list(cls, project_id):
        sql = """select *
                from tbl_location
                where use_yn = 'Y' and project_id = :project_id;"""
        return db.engine.execute(text(sql),{'project_id':project_id})

    @classmethod
    def del_location_station_list(cls, location_id):
        sql = """select *
                from tbl_location_station 
                where use_yn = 'Y' and location_id = :location_id;"""
        return db.engine.execute(text(sql),{'location_id':location_id})


    @classmethod
    def locationsearch(cls, param):
        location_id, location_name,  project_name, project_id = param
        sql = """select row_number() over(order by a.create_date desc) row_cnt, a.location_id, a.location_name, a.location_description, a.project_id, b.project_name
                from tbl_location a left join tbl_project b on a.project_id = b.project_id
                where a.use_yn = 'Y' and b.use_yn = 'Y'"""

        if(project_id):
            sql+= "and a.project_id = '"+project_id+"'"

        if(project_name):
            sql += "and b.project_name like '%" + project_name + "%';"

        elif(location_name):
            sql += "and a.location_name like '%" + location_name + "%';"

        elif(location_id):
            sql += "and a.location_id like '%" + location_id + "%';"

     
      
        return db.engine.execute(text(sql))

    @classmethod
    def find_by_USE_id(cls, location_name):
        sql = '''
            SELECT * FROM tbl_location
            WHERE location_name = :location_name
            and use_yn = "Y";
        '''
        return db.engine.execute(text(sql),{'location_name':location_name})

        