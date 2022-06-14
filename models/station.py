from datetime import datetime

from sqlalchemy.sql.functions import user
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func


class stationModel(db.Model):
    __tablename__ = 'tbl_station'

    station_seq = db.Column(db.BigInteger, primary_key=True, autoincrement=True)     # 로케이션 아이디 
    station_id = db.Column(db.String(50), nullable=False)                         # 스테이션 아이디 
    station_name = db.Column(db.String(50), nullable=False)                         # 스테이션 네임
    station_ipAddress = db.Column(db.String(200), nullable=True)                   # 스테이션 ip Address 정보
    station_udp1 = db.Column(db.Integer, nullable=True)                                # 스테이션 udp1
    station_udp2 = db.Column(db.Integer, nullable=True)                                # 스테이션 udp2
    station_udp3 = db.Column(db.Integer, nullable=True)                                # 스테이션 udp3
    
    
    use_yn = db.Column(db.String(50), nullable=False)                              # 사용자 아이디
    current_user_id = db.Column(db.String(50), nullable=False)                              # 사용자 아이디
           
    
    create_date = db.Column(db.DateTime)                     # 생성 일시
    modify_date = db.Column(db.DateTime)                     # 수정 일시

    def __init__(self, station_id, station_name, station_ipAddress, station_udp1, station_udp2, station_udp3, use_yn, current_user_id,create_date,modify_date):

        self.station_id = station_id
        self.station_name = station_name
        self.station_ipAddress = station_ipAddress
        self.station_udp1 = station_udp1
        self.station_udp2 = station_udp2
        self.station_udp3 = station_udp3
        self.use_yn = use_yn
        self.current_user_id = current_user_id
        self.create_date = create_date
        self.modify_date = modify_date
        
       
    @classmethod
    def find_by_id(cls, station_id):
        return cls.query.filter_by(station_id=station_id, use_yn='Y').first()

    @classmethod
    def find_by_seq(cls, station_seq):
        return cls.query.filter_by(station_seq=station_seq, use_yn='Y').first()

    @classmethod
    def find_by_name(cls, station_name):
        return cls.query.filter_by(station_name=station_name, use_yn='Y').first()

    @classmethod
    def find_by_id_all(cls, location_id):
        return cls.query.filter_by(location_id=location_id, use_yn='Y').all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def stationsearch(cls, param):
        station_id ,  station_name, project_name, location_name, station_ipAddress, project_id= param
        sql = """select row_number() over(order by e.create_date desc) row_cnt, e.station_id, e.station_name, e.station_ipAddress, f.project_name, f.project_id, f.location_id, f.location_name,
                 e.station_udp1, e.station_udp2, e.station_udp3, e.station_seq from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name, d.project_id, d.project_name from  tbl_location_station c left join (
                select a.location_id, a.location_name, b.project_id, b.project_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq where project_id is not null and location_id is not null """

        if(project_id):
            sql+="and f.project_id ='"+project_id+"'"

            if(project_name):
                sql += "and f.project_name like '%" + project_name + "%';"

            elif(station_name):
                sql += "and e.station_name like '%" + station_name + "%';"

            elif(station_id):
                sql += "and e.station_id like '%" + station_id + "%';"
            
            elif(location_name):
                sql += "and f.location_name like '%" + location_name + "%';"

            elif(station_ipAddress):
                sql += "and e.station_ipAddress like '%" + station_ipAddress + "%';"
            

        else:

            if(project_name):
                sql += "and f.project_name like '%" + project_name + "%';"

            elif(station_name):
                sql += "and e.station_name like '%" + station_name + "%';"

            elif(station_id):
                sql += "and e.station_id like '%" + station_id + "%';"
            
            elif(location_name):
                sql += "and f.location_name like '%" + location_name + "%';"

            elif(station_ipAddress):
                sql += "and e.station_ipAddress like '%" + station_ipAddress + "%';"

      
            
        return db.engine.execute(text(sql))

    @classmethod
    def find_by_id_edit(cls, station_id):
        print(station_id)
        sql  = """select row_number() over(order by e.create_date desc) row_cnt, e.station_id, e.station_name, e.station_ipAddress, f.project_name, f.project_id, f.location_id, f.location_name, e.station_seq,
                 e.station_udp1, e.station_udp2, e.station_udp3, e.station_seq from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name, d.project_id, d.project_name from  tbl_location_station c left join (
                select a.location_id, a.location_name, b.project_id, b.project_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq 
                where e.station_id = '"""+station_id+"""';"""


        return db.engine.execute(text(sql))

    @classmethod
    def find_by_USE_id(cls, station_id):
        sql = '''
            SELECT * FROM tbl_station
            WHERE station_id = :station_id and use_yn = 'Y'
           ;
        '''
        return db.engine.execute(text(sql),{'station_id':station_id})

    @classmethod
    def find_by_USE_name(cls, station_name):
        sql = '''
            SELECT * FROM tbl_station
            WHERE station_name = :station_name and use_yn = 'Y'
           ;
        '''
        return db.engine.execute(text(sql),{'station_name':station_name})


    @classmethod
    def monitoring_lo_st(cls, location_id):
        sql  = """select  e.station_id, e.station_name, e.station_ipAddress,  f.location_id, f.location_name,
                 e.station_udp1, e.station_udp2, e.station_udp3 from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name from  tbl_location_station c left join (
                select a.location_id, a.location_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq
                where f.location_id = '"""+location_id+"""';"""

        return db.engine.execute(text(sql))

    @classmethod
    def monitoring_lo_st_station_id(cls, location_id):
        sql  = """select  e.station_id from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name from  tbl_location_station c left join (
                select a.location_id, a.location_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq
                where f.location_id = '"""+location_id+"""';"""

        return db.engine.execute(text(sql))

    @classmethod
    def find_project_user(cls, user_id):
        sql="""select g.station_id, g.station_name, g.project_name, g.project_id, g.location_id, g.location_name, g.station_seq, h.user_id, h.user_gr
                from (select e.station_id, e.station_name, f.project_name, f.project_id, f.location_id, f.location_name,
                e.station_seq from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name, d.project_id, d.project_name from  tbl_location_station c left join (
                select a.location_id, a.location_name, b.project_id, b.project_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq) g inner join (select user_id, user_gr, project_id from tbl_user where
                user_id = '""" + user_id + """') h on g.project_id=h.project_id;"""

        return db.engine.execute(text(sql))

   
    @classmethod
    def find_project_name(cls, project_name):
        sql = """select row_number() over(order by e.create_date desc) row_cnt, e.station_id, e.station_name, e.station_ipAddress, f.project_name, f.project_id, f.location_id, f.location_name,
                 e.station_udp1, e.station_udp2, e.station_udp3, e.station_seq from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name, d.project_id, d.project_name from  tbl_location_station c left join (
                select a.location_id, a.location_name, b.project_id, b.project_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq where project_name = '"""+project_name+"';"



        return db.engine.execute(text(sql))

    @classmethod
    def find_project_id(cls, project_id):
        sql = """select row_number() over(order by e.create_date desc) row_cnt, e.station_id, e.station_name, e.station_ipAddress, f.project_name, f.project_id, f.location_id, f.location_name,
                 e.station_udp1, e.station_udp2, e.station_udp3, e.station_seq from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name, d.project_id, d.project_name from  tbl_location_station c left join (
                select a.location_id, a.location_name, b.project_id, b.project_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq where f.project_id = '"""+project_id+"';"



        return db.engine.execute(text(sql))

    @classmethod
    def find_location_name(cls, location_name):
        sql = """select row_number() over(order by e.create_date desc) row_cnt, e.station_id, e.station_name, e.station_ipAddress, f.project_name, f.project_id, f.location_id, f.location_name,
                 e.station_udp1, e.station_udp2, e.station_udp3, e.station_seq from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name, d.project_id, d.project_name from  tbl_location_station c left join (
                select a.location_id, a.location_name, b.project_id, b.project_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq where location_name = '"""+location_name+"';"

        return db.engine.execute(text(sql))


    @classmethod
    def find_location_id(cls, location_id):
        sql = """select row_number() over(order by e.create_date desc) row_cnt, e.station_id, e.station_name, e.station_ipAddress, f.project_name, f.project_id, f.location_id, f.location_name,
                 e.station_udp1, e.station_udp2, e.station_udp3, e.station_seq from tbl_station e 
                inner join (select c.station_seq, d.location_id, d.location_name, d.project_id, d.project_name from  tbl_location_station c left join (
                select a.location_id, a.location_name, b.project_id, b.project_name from tbl_location a 
                left join tbl_project b on a.project_id = b.project_id and a.use_yn = 'Y' and b.use_yn = 'Y') d on c.location_id = d.location_id
                where c.use_yn = 'Y') f on e.station_seq = f.station_seq where f.location_id = '"""+location_id+"';"

        return db.engine.execute(text(sql))

    @classmethod
    def station_list(cls):
        sql = '''
            SELECT distinct station_id FROM tbl_station where use_yn = 'Y';
        '''
        return db.engine.execute(text(sql))