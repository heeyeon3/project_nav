from datetime import datetime
from sqlalchemy import sql

from sqlalchemy.sql.functions import user
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func


class projectModel(db.Model):
    __tablename__ = 'tbl_project'

    project_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)     # 프로젝트 아이디 
    project_name = db.Column(db.String(50), nullable=False)                         # 프로젝트 네임
    project_description = db.Column(db.String, nullable=False)                      # 프로젝트 상세 정보
    project_company = db.Column(db.String(50), nullable=False)                      # 프로젝트 회사
    use_yn = db.Column(db.String(1), nullable = False, default = 'Y')               # 사용 여부
    current_user_id = db.Column(db.String(50), nullable=False)                      # 사용자 아이디

    create_date = db.Column(db.DateTime)                    # 생성 일시
    modify_date = db.Column(db.DateTime)                    # 수정 일시

    def __init__(self,  project_name, project_description, project_company, use_yn, current_user_id, create_date, modify_date):

        self.project_name = project_name
        self.project_description = project_description
        self.project_company = project_company
        self.use_yn = use_yn
        self.current_user_id = current_user_id
        self.create_date = create_date
        self.modify_date = modify_date
        # 결함리포트 4 - 1 

    @classmethod
    def find_by_id(cls, project_id):
        return cls.query.filter_by(project_id=project_id).first()
        
    @classmethod
    def find_by_id_all(cls, user_id):
        return cls.query.filter_by(user_id=user_id).all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_by_USE_id(cls, project_name):
        sql = '''
            SELECT * FROM tbl_project
            WHERE project_name = :project_name
            and use_yn = "Y";
        '''
        return db.engine.execute(text(sql),{'project_name':project_name})

    @classmethod
    def projectlist(cls):
        sql = """select project_id, project_name from tbl_project
                 where use_yn = 'Y'; """

        return db.engine.execute(text(sql))

    @classmethod
    def projectlist_usergr(cls, project_id):
        sql = """select project_id, project_name from tbl_project
                 where use_yn = 'Y' and project_id = '"""+project_id+"""'; """

        return db.engine.execute(text(sql))

    @classmethod
    def projectsearch(cls, param):
        project_name, project_description, project_company = param
        sql = """select row_number() over(order by create_date desc) row_cnt, project_id, project_name, project_description, project_company 
                from tbl_project
                 where use_yn = 'Y'"""

        if(project_name):
            sql += "and project_name like '%" + project_name + "%';"

        elif(project_description):
            sql += "and project_description like '%" + project_description + "%';"
        elif(project_company):
            sql += "and project_company like '%" + project_company + "%';"


        

        # if start is not None:
        #     if int(length) > 0:
        #         sql += " limit " + str(length) + " offset " + str(start)

        return db.engine.execute(text(sql))

    @classmethod
    def project_count(cls):
        sql = '''
            SELECT count(*) tot_cnt
            from tbl_project
            where use_yn = 'Y'; 
        '''
        return db.engine.execute(text(sql))
