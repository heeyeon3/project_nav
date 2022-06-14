from datetime import datetime

from sqlalchemy.sql.functions import current_date, user
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func


class satelliteModel(db.Model):
    __tablename__ = 'tbl_satellite'

    satellite_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)     # 로우데이터 아이디 
    station_id = db.Column(db.String(45), primary_key=True)                            # 스테이션 아이디 
    satellite_base = db.Column(db.String(45), nullable=False)                         # 베이스 아이디
    satellite_mon = db.Column(db.String(45), nullable=False)                          # 로버 아이디
 
    satellite_gnssno = db.Column(db.Integer, nullable=False)                            # 위성 종류
    satellite_gnsstyle = db.Column(db.String(10), nullable=False)                          # 위성 타입
    satellite_svno = db.Column(db.Integer, nullable=False)                              # 위성 번호
    satellite_elevation = db.Column(db.Float, nullable=False)                         # 위성 고도각
    satellite_azimuth = db.Column(db.Float, nullable=False)                           # 위성 방위각
    satellite_L1 = db.Column(db.Float, nullable=False)                                # L1 신호 강도
    satellite_L2 = db.Column(db.Float, nullable=False)                                # L2 신호 강도
    satellite_checksum = db.Column(db.String(10), nullable=False)                                # L2 신호 강도
    satellite_udp_port = db.Column(db.String(10), nullable=False)                                # L2 신호 강도
    satellite_ip = db.Column(db.String(25), nullable=False)                                # L2 신호 강도

    satellite_date = db.Column(db.DateTime, nullable=False)
    create_date = db.Column(db.DateTime,  default=datetime.now())

    
   

    def __init__(self, satellite_id, station_id, satellite_base, satellite_mon, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, 
                satellite_azimuth, satellite_L1, satellite_L2, satellite_checksum,satellite_udp_port,satellite_ip, satellite_date, create_date):

        self.satellite_id = satellite_id
        self.station_id = station_id
        self.satellite_base = satellite_base
        self.satellite_mon = satellite_mon
        self.satellite_gnssno = satellite_gnssno
        self.satellite_gnsstyle = satellite_gnsstyle
        self.satellite_svno = satellite_svno
        self.satellite_elevation = satellite_elevation
        self.satellite_azimuth = satellite_azimuth
        self.satellite_L1 = satellite_L1
        self.satellite_L2 = satellite_L2
        self.satellite_checksum = satellite_checksum
        self.satellite_udp_port = satellite_udp_port
        self.satellite_ip = satellite_ip

        self.satellite_date = satellite_date
        self.create_date = create_date
       

    @classmethod
    def find_by_id(cls, satellite_id):
        return cls.query.filter_by(satellite_id=satellite_id).first()

    @classmethod
    def find_by_id_all(cls, station_id):
        return cls.query.filter_by(station_id=station_id).all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_by_id_satedata(cls, param):
        station_id, startdate, enddate, ratedate, gnsstype, satellitetype = param

        # sql = """select station_id, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, satellite_azimuth, satellite_L1,satellite_L2, date_format(satellite_date, '%Y-%m-%d %H:%i:%S')  satellite_date
        #             from tbl_satellite       
        #             where station_id = '"""+station_id+"""'
        #             and satellite_date between date('"""+startdate+"""') and date('"""+enddate+"""')+1
        #             and satellite_svno in ("""+satellitetype+""")
        #             and satellite_gnsstyle in ("""+gnsstype+""")
        #             and mod(substr(satellite_date,15,2),"""+ratedate+""")=0 order by satellite_date;"""

        sql = """
                select station_id, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, satellite_azimuth, satellite_L1,satellite_L2, date_format(satellite_date, '%Y-%m-%d %H:%i:%S')  satellite_date
                    from tbl_satellite       
                    where station_id = '"""+station_id+"""'
                    and satellite_date between date('"""+startdate+"""') and date('"""+enddate+"""')+1
                    and satellite_svno in ("""+satellitetype+""")
                    and satellite_gnsstyle in ("""+gnsstype+""")
                    and mod(TIMESTAMPDIFF(minute,(select satellite_date from tbl_satellite
                    where station_id = '"""+station_id+"""' limit 1),satellite_date),"""+ratedate+""")=0 order by satellite_date;
            """
        return db.engine.execute(text(sql))

    @classmethod
    def current_satellite_data(cls, param):
        station_id, nowDatetime, datetimenow_1 = param
        # sql = """select station_id, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, satellite_azimuth, satellite_L1,satellite_L2, date_format(satellite_date, '%Y-%m-%d %H:%i:%S')  satellite_date
        #          from tbl_satellite
        #             where station_id ='"""+station_id+"""' and satellite_date between '"""+datetimenow_1+"""' and now() ;"""


        sql="""select station_id, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, satellite_azimuth, satellite_L1,satellite_L2, date_format(satellite_date, '%Y-%m-%d %H:%i:%S')  satellite_date
                from tbl_satellite
                                        where station_id ='"""+station_id+"""' and satellite_date =(select date_format(satellite_date, '%Y-%m-%d %H:%i:%S')  satellite_date from tbl_satellite
                    where station_id ='"""+station_id+"""' order by satellite_date desc limit 1
                    ) ;"""

     

        # sql = """select station_id, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, satellite_azimuth, satellite_L1,satellite_L2, date_format(satellite_date, '%Y-%m-%d %H:%i:%S')  satellite_date
        #          from tbl_satellite
        #             where satellite_date = (SELECT satellite_date FROM NAVSYS.tbl_satellite
        #             where station_id ='"""+station_id+"""'
        #             and timestampdiff(minute, satellite_date, '"""+nowDatetime+"""') < 10
		# 			order by satellite_date desc limit 1) and station_id ='"""+station_id+"""';"""

     
        return db.engine.execute(text(sql))


class satellite60Model(db.Model):
    __tablename__ = 'tbl_satellite60'

    satellite_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)     # 로우데이터 아이디 
    station_id = db.Column(db.String(45), primary_key=True)                            # 스테이션 아이디 
    satellite_base = db.Column(db.String(45), nullable=False)                         # 베이스 아이디
    satellite_mon = db.Column(db.String(45), nullable=False)                          # 로버 아이디
 
    satellite_gnssno = db.Column(db.Integer, nullable=False)                            # 위성 종류
    satellite_gnsstyle = db.Column(db.String(10), nullable=False)                          # 위성 타입
    satellite_svno = db.Column(db.Integer, nullable=False)                              # 위성 번호
    satellite_elevation = db.Column(db.Float, nullable=False)                         # 위성 고도각
    satellite_azimuth = db.Column(db.Float, nullable=False)                           # 위성 방위각
    satellite_L1 = db.Column(db.Float, nullable=False)                                # L1 신호 강도
    satellite_L2 = db.Column(db.Float, nullable=False)                                # L2 신호 강도
    satellite_checksum = db.Column(db.String(10), nullable=False)                                # L2 신호 강도

    satellite_date = db.Column(db.DateTime, nullable=False)
    create_date = db.Column(db.DateTime,  default=datetime.now())
    
   

    def __init__(self, satellite_id, station_id, satellite_base, satellite_mon, satellite_gnssno, satellite_gnsstyle, satellite_svno, satellite_elevation, 
                satellite_azimuth, satellite_L1, satellite_L2,satellite_checksum, satellite_date, create_date):

        self.satellite_id = satellite_id
        self.station_id = station_id
        self.satellite_base = satellite_base
        self.satellite_mon = satellite_mon
        self.satellite_gnssno = satellite_gnssno
        self.satellite_gnsstyle = satellite_gnsstyle
        self.satellite_svno = satellite_svno
        self.satellite_elevation = satellite_elevation
        self.satellite_azimuth = satellite_azimuth
        self.satellite_L1 = satellite_L1
        self.satellite_L2 = satellite_L2
        self.satellite_checksum = satellite_checksum
        self.satellite_date = satellite_date
        self.create_date = create_date
       

    @classmethod
    def find_by_id(cls, satellite_id):
        return cls.query.filter_by(satellite_id=satellite_id).first()

    @classmethod
    def find_by_id_all(cls, satellite_id):
        return cls.query.filter_by(satellite_id=satellite_id).all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()