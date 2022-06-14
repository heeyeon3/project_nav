from datetime import datetime

from sqlalchemy.orm import defaultload
from sqlalchemy.sql.expression import _Null, null
from sqlalchemy.sql.type_api import NULLTYPE
from core.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from models.code import CodeModel
from sqlalchemy.sql import text
from flask_login import current_user



class UserModel(db.Model):
    __tablename__ = 'tbl_user'

    user_id = db.Column(db.String(20), primary_key=True)                    # 사용자 아이디
    user_pwd = db.Column(db.String(128), nullable=False)                    # 사용자 패스워드(hash 양방향 암호)
    user_nm = db.Column(db.String(20), nullable=True)                       # 사용자명
    user_gr = db.Column(db.String(4), nullable=False)                       # 사용자 등급(TBL_COMMON)
    user_email = db.Column(db.String(100), nullable=True)                   # 사용자 이메일
    project_id = db.Column(db.String(100), nullable=True)                   # 프로젝트 아이디
    user_conn_date = db.Column(db.DateTime, default=datetime.now())         # 사용자 로그인한 시간(90일 미접속 시 휴면계정 전환 체크)
    user_dor_acc = db.Column(db.String(1), nullable=False, default="N")     # 사용자 휴먼계정여부
    user_pwd_change_dt = db.Column(db.DateTime, default=datetime.now())     # 사용자 비밀번호 변경 일자
    user_yn = db.Column(db.String(1), nullable=False, default="Y")          # 사용자 활성화/비활성화(default:Y)
    user_auth = db.Column(db.Boolean, nullable=False, default=False)        # 사용자 접속 현황
    user_fail_count = db.Column(db.String(5), nullable=False)               # 사용자 접속 현황
    create_user_id =    db.Column(db.String(20),nullable=True)              # 생성자 아이디(나를 생성한 아이디)
    
    create_date = db.Column(db.DateTime)
    modify_date = db.Column(db.DateTime)

    def __init__(self, user_id, user_pwd, user_nm, user_gr, user_email, project_id, user_dor_acc, user_yn,
                  user_auth, user_fail_count, create_user_id, create_date, modify_date):

        self.user_id = user_id
        self.set_password(user_pwd)
        self.user_nm = user_nm
        self.user_gr = user_gr
        self.user_email = user_email
        self.project_id = project_id
        self.user_dor_acc = user_dor_acc
        self.user_yn = user_yn
        self.user_auth = user_auth
        self.user_fail_count = user_fail_count
        self.create_user_id = create_user_id
        self.create_date = create_date
        self.modify_date = modify_date
        
       

    def set_password(self, password):
        self.user_pwd = generate_password_hash(password)

    def set_dor_acc(self):
        self.user_dor_acc = "N"
        self.user_conn_date = None

    def check_id_pwd(self, user_id):
        return check_password_hash(self.user_pwd, user_id)

    def check_password(self, password):
        return check_password_hash(self.user_pwd, password)

    def check_time(self):
        sql = """
        select DATEDIFF( NOW(), user_conn_date ) AS DiffDo,  DATEDIFF( NOW(), user_pwd_change_dt ) AS DiffPw  
        from tbl_user 

        """
        sql += "where user_id = '" + self.user_id + "'"

        return db.engine.execute(text(sql))


    @classmethod
    def get_password(cls, user_id, user_nm, user_email):
        sql = """
            select user_pwd 
            from tbl_user
            where user_nm = :user_nm and user_email = :user_email and user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_nm':user_nm, 'user_email':user_email, 'user_id':user_id})

    @classmethod
    def find_by_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id).first()

    @classmethod
    def get_user_gr(cls, user_id):
        sql = """
            select user_gr
            from tbl_user
            where user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

    @classmethod
    def get_create_user_id(cls, user_id):
        sql = """
            select create_user_id
            from tbl_user
            where user_id = :user_id
        """
        return db.engine.execute(text(sql), {'user_id' :user_id})

        
    @classmethod
    def find_all_user_count(cls, params):
        user_id, user_nm, user_gr = params

        sql = """
            select count(*) tot_cnt
            from tbl_user a
            where a.user_gr != "0101"
            """

        if user_id:
            sql += "and a.user_id like '%" + user_id + "%'"
        elif user_nm:
            sql += " and a.user_nm like '%" + user_nm + "%'"
        elif user_gr:
            sql += " and a.user_gr like '%" + user_gr + "%'"
        # elif group_id:
        #     sql += " and a.group_id = '" + group_id + "'"
        
        if current_user.user_gr != "0101":
            sql += " and (a.user_id = '"+current_user.user_id+"' or a.create_user_id = '"+current_user.user_id+"')"

        print("find_all_user_count list sql >>" + sql)

        return db.engine.execute(text(sql))

    @classmethod
    def find_all_user(cls, params):
        user_id, user_nm, project_name, comm_nm,  user_email,  user_gr, project_id = params
        

        sql = """
             select row_number() OVER(order by c.create_date desc) row_cnt,
                    c.user_id,c.user_nm, c.user_yn, c.user_pwd, c.user_gr, c.project_id, c.user_email, c.project_name, d.comm_nm 
				    from  (select a.create_date, a.user_id,a.user_nm, a.user_gr, a.user_yn, a.user_pwd,
                      a.project_id, a.user_email, b.project_name
                   from tbl_user a left join tbl_project b on a.project_id = b.project_id
                   where a.user_yn = 'Y') c left join tbl_common d on d.comm_cd = c.user_gr
                   where c.user_gr not in ('0101')
                 """
        if(user_gr == '0103' or user_gr == '0104'):
            sql += " and c.project_id = '"+project_id+"'"
        
            if user_id:
                sql += " and c.user_id like '%"+user_id+"%'"
            elif user_nm:
                sql += " and c.user_nm like '%"+user_nm+"%'"
            elif comm_nm:
                sql += " and d.comm_nm like '%"+comm_nm+"%'"
            elif user_email:
                sql += " and c.user_email like '%"+user_email+"%'"
            elif project_name:
                sql += " and c.project_name like '%"+project_name+"%'"

        else:
            if user_id:
                sql += " and c.user_id like '%"+user_id+"%'"
            elif user_nm:
                sql += " and c.user_nm like '%"+user_nm+"%'"
            elif comm_nm:
                sql += " and d.comm_nm like '%"+comm_nm+"%'"
            elif user_email:
                sql += " and c.user_email like '%"+user_email+"%'"
            elif project_name:
                sql += " and c.project_name like '%"+project_name+"%'"
       
         
        return db.engine.execute(text(sql))

    def is_active(self):
        return True

    def get_id(self):
        return self.user_id

    def is_authenticated(self):
        return self.user_auth

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def get_user_code(cls, user_gr):

        return db.session.query(cls.user_id, cls.user_nm, CodeModel.comm_nm)\
                         .join(CodeModel, cls.user_gr == CodeModel.comm_cd) \
                         .filter(cls.user_gr.in_(user_gr))\
                         .filter(CodeModel.comm_up_cd == '0100').all()


    @classmethod
    def find_user_list(cls):
        sql = """select user_id, user_nm, user_gr, user_email."""


    @classmethod
    def find_by_id_edit(cls, user_id):
        sql  = """select row_number() OVER(order by c.create_date desc) row_cnt, c.user_fail_count,
                    c.user_id,c.user_nm, c.user_yn, c.user_pwd, c.user_gr, c.project_id, c.user_email, c.project_name, d.comm_nm 
				    from  (select a.create_date, a.user_id,a.user_nm, a.user_gr, a.user_yn, a.user_pwd,
                      a.project_id, a.user_email, b.project_name, a.user_fail_count
                   from tbl_user a left join tbl_project b on a.project_id = b.project_id
                   where a.user_yn = 'Y') c left join tbl_common d on d.comm_cd = c.user_gr
                   where c.user_id = '"""+user_id+"""';"""

        return db.engine.execute(text(sql))


    @classmethod
    def count_user(cls):
        sql  = """select count(*) from tbl_user;"""

        return db.engine.execute(text(sql))