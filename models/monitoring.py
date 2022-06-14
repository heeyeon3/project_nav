from datetime import datetime

from sqlalchemy.sql.functions import user
from core.db import db
from sqlalchemy.sql import text
from sqlalchemy import func


class monitoringModel(db.Model):
    __tablename__ = 'tbl_monitoring'

    monitoring_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)     # 로우데이터 아이디 
    station_id = db.Column(db.String(45), primary_key=True)                            # 스테이션 아이디 
    monitoring_base = db.Column(db.String(45), nullable=False)                         # 베이스 아이디
    monitoring_mon = db.Column(db.String(45), nullable=False)                          # 로버 아이디
    monitoring_E = db.Column(db.Numeric, nullable=False)                                 # 동쪽
    monitoring_N = db.Column(db.Numeric, nullable=False)                                 # 서쪽
    monitoring_U = db.Column(db.Numeric, nullable=False)                                 # 고도
    monitoring_X = db.Column(db.Numeric, nullable=False)                                 # WGS84 X
    monitoring_Y = db.Column(db.Numeric, nullable=False)                                 # WGS84 Y
    monitoring_Z = db.Column(db.Numeric, nullable=False)                                 # WGS84 Z
    monitoring_fix = db.Column(db.Numeric, nullable=False)                               #
    monitoring_checksum = db.Column(db.String(10), nullable=False) 
    monitoring_udp_port = db.Column(db.String(10), nullable=False) 
    monitoring_ip = db.Column(db.String(25), nullable=False) 
                      
    monitoring_date = db.Column(db.DateTime, nullable=False)                           # 
    create_date = db.Column(db.DateTime,  default=datetime.now())                        # 
    
   

    def __init__(self, monitoring_id, station_id, monitoring_base, monitoring_mon,
                      monitoring_E, monitoring_N, monitoring_U, monitoring_X, monitoring_Y, monitoring_Z, monitoring_fix, monitoring_checksum, 
                      monitoring_udp_port,monitoring_ip, monitoring_date, create_date):

        self.monitoring_id = monitoring_id
        self.station_id = station_id
        self.monitoring_base = monitoring_base
        self.monitoring_mon = monitoring_mon
        self.monitoring_E = monitoring_E
        self.monitoring_N = monitoring_N
        self.monitoring_U = monitoring_U
        self.monitoring_X = monitoring_X
        self.monitoring_Y = monitoring_Y
        self.monitoring_Z = monitoring_Z
        self.monitoring_fix = monitoring_fix
        self.monitoring_checksum = monitoring_checksum
        self.monitoring_udp_port = monitoring_udp_port
        self.monitoring_ip = monitoring_ip


        self.monitoring_date = monitoring_date
        self.create_date = create_date

    @classmethod
    def find_by_id(cls, monitoring_id):
        return cls.query.filter_by(monitoring_id=monitoring_id).first()

    @classmethod
    def find_by_id_all(cls, station_id):
        return cls.query.filter_by(station_id=station_id).all()

    @classmethod
    def find_by_id_data(cls, param):
        station_id, monitoring_date,lastday = param

        sql = """SELECT station_id, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E, replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
                    replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, monitoring_udp_port,  date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date  FROM tbl_monitoring_10
                    where station_id = '"""+station_id+"""' and monitoring_date between '"""+monitoring_date+"' and '"+lastday+"""' order by monitoring_date
                """

        
 
        return db.engine.execute(text(sql))

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

    
    @classmethod
    def find_station_id_data(cls, station_seq):
        
        sql = """select monitoring_id, station_id, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E, replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
                    replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
                where station_id = (select station_id from tbl_station where station_seq = '"""+station_seq+"');"
        return db.engine.execute(text(sql))


    @classmethod
    def find_location_id_data(cls, location_id):
        
        sql = """select monitoring_id, station_id, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E, replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
                    replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
                    where station_id in (select station_id from  tbl_station
                    where station_seq in (select station_seq from tbl_location_station
                    where location_id = '""" +location_id+"'and use_yn = 'Y'));" 
        return db.engine.execute(text(sql))


    @classmethod
    def find_project_id_data(cls, project_id):
        
        sql = """select monitoring_id, station_id, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E, replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N,
                    replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
                    where station_id in (select station_id from  tbl_station
                    where station_seq in (select station_seq from tbl_location_station
                    where use_yn = 'Y' and location_id in ( select location_id from tbl_location where project_id = '""" +project_id+"')));"
            
        return db.engine.execute(text(sql))

    @classmethod
    def find_mapinfo(cls, station_id):
        sql = """
                select a.station_id, replace(FORMAT(a.monitoring_X,5), ',' , '') monitoring_X, replace(FORMAT(a.monitoring_Y,5), ',' , '') monitoring_Y, replace(FORMAT(a.monitoring_Z,5), ',' , '') monitoring_Z, b.station_name, 
                date_format(a.monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring_10 a
                left join (select station_name, station_id from tbl_station) b on a.station_id = b.station_id
                where a.station_id in ("""+station_id+""")
                order by a.monitoring_date desc;
            """

            # sql = """
            #     select a.station_id, FORMAT(a.monitoring_X,5) monitoring_X, a.monitoring_Y, a.monitoring_Z, b.station_name, date_format(a.monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring_10 a
            #     left join (select station_name, station_id from tbl_station) b on a.station_id = b.station_id
            #     where a.station_id in ("""+station_id+""")
            #     order by a.monitoring_date desc;
            # """


        # sql = """select a.station_id, a.monitoring_X, a.monitoring_Y, a.monitoring_Z, b.station_name, date_format(a.monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from (select station_id, monitoring_X, monitoring_Y, monitoring_Z, monitoring_date from tbl_monitoring
        #         where station_id in ("""+station_id+""")
        #         and timestampdiff(minute, monitoring_date,now()) < 10) a left join (select station_id, station_name from tbl_station where use_yn = 'Y') b
        #         on a.station_id = b.station_id order by monitoring_date desc;"""
       

        return db.engine.execute(text(sql))


    @classmethod
    def find_save_data(cls, param): #엑셀다운
        station_id, startdate, enddate, ratedate, udpport  = param

        sql = """select station_id, monitoring_base, monitoring_mon, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E ,replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
                            replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, replace(FORMAT(monitoring_X,5), ',' , '') monitoring_X,replace(FORMAT(monitoring_Y,5), ',' , '')  monitoring_Y, 
                            replace(FORMAT(monitoring_Z,5), ',' , '') monitoring_Z, replace(FORMAT(monitoring_fix,5), ',' , '') monitoring_fix, monitoring_checksum,
                            date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
                            where station_id = '""" +station_id + "' and monitoring_date between date('"+startdate+"') and date('"+enddate+ """')+1 
                            and monitoring_udp_port ='"""+udpport+"""' and mod(TIMESTAMPDIFF(MINUTE,(select monitoring_date from tbl_monitoring
            where monitoring_date like '"""+startdate+"""%' and station_id = '""" +station_id + """'
            limit 1),monitoring_date), """+ratedate+""")=0 and substr(monitoring_date, 18,2) =(select substr(monitoring_date, 18,2) from tbl_monitoring
            where monitoring_date like '"""+startdate+"""%' and station_id = '""" +station_id + """'
            limit 1)"""


        # sql = """select station_id, monitoring_base, monitoring_mon,replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E ,replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
        #         replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, replace(FORMAT(monitoring_X,5), ',' , '') monitoring_X,replace(FORMAT(monitoring_Y,5), ',' , '')  monitoring_Y, 
        #         replace(FORMAT(monitoring_Z,5), ',' , '') monitoring_Z, replace(FORMAT(monitoring_fix,5), ',' , '') monitoring_fix, monitoring_checksum,
        #         date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
        #         where monitoring_id in (select min(monitoring_id) from tbl_monitoring where station_id = '""" +station_id + "' and monitoring_date between date('"+startdate+"') and date('"+enddate+ """')+1
        #         and monitoring_udp_port = '"""+udpport+"""'
        #         and mod(substr(monitoring_date,15,2),"""+ratedate+""")=0 group by substr(monitoring_date,1,16));"""

      
        # sql = """select station_id, monitoring_base, monitoring_mon, monitoring_E, monitoring_N, monitoring_U, monitoring_X, monitoring_Y, monitoring_Z, monitoring_fix, monitoring_checksum,
        #         date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
        #         where station_id = '""" +station_id + "' and monitoring_date in ("+ratedate_list+""") 
        #         """
        
                
        return db.engine.execute(text(sql))

    @classmethod
    def find_save_data_first(cls, param): 
        station_id, startdate, enddate  = param
        sql = """select station_id, monitoring_base, monitoring_mon, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E ,replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
                replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, replace(FORMAT(monitoring_X,5), ',' , '') monitoring_X,replace(FORMAT(monitoring_Y,5), ',' , '')  monitoring_Y, 
                replace(FORMAT(monitoring_Z,5), ',' , '') monitoring_Z, replace(FORMAT(monitoring_fix,5), ',' , '') monitoring_fix, monitoring_checksum,
                date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
                where station_id = '""" +station_id + "' and monitoring_date between date('"+startdate+"') and date('"+enddate+ """')+1
                order by monitoring_date limit 1;"""

                
        return db.engine.execute(text(sql))

    @classmethod
    def find_save_data2(cls, param):
        station_id, startdate, enddate, ratedate, udp_list  = param



        sql="""select station_id, monitoring_base, monitoring_mon, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E ,replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
                            replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, replace(FORMAT(monitoring_X,5), ',' , '') monitoring_X,replace(FORMAT(monitoring_Y,5), ',' , '')  monitoring_Y, 
                            replace(FORMAT(monitoring_Z,5), ',' , '') monitoring_Z, replace(FORMAT(monitoring_fix,5), ',' , '') monitoring_fix, 
                            monitoring_ip, monitoring_udp_port,
                            date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
                            where station_id = '"""+station_id+"""' and monitoring_date between date('"""+startdate+"') and date('"+enddate+"""')+1 
                            and monitoring_udp_port in ("""+udp_list+""")
                            and mod(TIMESTAMPDIFF(second,(select monitoring_date from tbl_monitoring
            where station_id = '"""+station_id+"""'
            limit 1),monitoring_date), """+ratedate+""")=0"""

        # sql = """select station_id, monitoring_base, monitoring_mon, replace(FORMAT(monitoring_E,5), ',' , '') monitoring_E ,replace(FORMAT(monitoring_N,5), ',' , '') monitoring_N, 
        #         replace(FORMAT(monitoring_U,5), ',' , '') monitoring_U, replace(FORMAT(monitoring_X,5), ',' , '') monitoring_X,replace(FORMAT(monitoring_Y,5), ',' , '')  monitoring_Y, 
        #         replace(FORMAT(monitoring_Z,5), ',' , '') monitoring_Z, replace(FORMAT(monitoring_fix,5), ',' , '') monitoring_fix, 
        #         monitoring_checksum, monitoring_ip, monitoring_udp_port,
        #         date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date,  time_to_sec(timediff(monitoring_date, (select date_format(monitoring_date, '%H:%i:%S') monitoring_date from tbl_monitoring
        #         where station_id = '"""+station_id+"' and monitoring_date between date('"+startdate+"') and date('"+enddate+"""')+1 
        #         order by monitoring_date limit 1))) diff from tbl_monitoring
        #         where station_id = '"""+station_id+"' and monitoring_date between date('"+startdate+"') and date('"+enddate+"""')+1
        #         and monitoring_udp_port in ("""+udp_list+""")
        #         and mod(time_to_sec(timediff(monitoring_date, (select date_format(monitoring_date, '%Y-%m-%d %H:%i:%S') monitoring_date from tbl_monitoring
        #         where station_id = '"""+station_id+"' and monitoring_date between date('"+startdate+"') and date('"+enddate+"""')+1
        #         order by monitoring_date limit 1))),"""+ratedate+") = 0;"



        

        
                
  
        return db.engine.execute(text(sql))

    @classmethod
    def tooltip_data_monitoring(cls, station_id):
        

        sql = """select substr(monitoring_date,1,10) monitoring_date from tbl_monitoring
                    where station_id in (""" +station_id+ """)
                    group by substr(monitoring_date,1,10) 
                    order by monitoring_date desc limit 30
                    """

        # sql = """select substr(monitoring_date,1,10) monitoring_date from tbl_monitoring
        #             where station_id in (""" +station_id+ """)
        #             group by substr(monitoring_date,1,10) 
        #             limit 30
        #             """

        print(sql)

    
        return db.engine.execute(text(sql))

    @classmethod
    def tooltip_data_satellite(cls, station_id):
        sql = """select distinct(substr(satellite_date,1,10)) satellite_date from tbl_satellite
                where satellite_date BETWEEN DATE_ADD(NOW(), INTERVAL -1 MONTH ) AND NOW()
                and station_id in (""" +station_id+ ") order by satellite_date desc limit 30;"
              
        # sql = """select distinct(substr(satellite_date,1,10)) satellite_date from tbl_satellite
        #         where station_id in (""" +station_id+ ") order by satellite_date desc limit 30;"
              
        return db.engine.execute(text(sql))

    @classmethod
    def data_10min_status(cls):
        
        sql = """
            select station_seq, station_id FROM tbl_station
                where station_id in (SELECT station_id FROM tbl_monitoring
                WHERE monitoring_date > now() - INTERVAL 10 MINUTE
                group by station_id) and use_yn = "Y";
            """
        return db.engine.execute(text(sql))

    @classmethod
    def data_10min_status_user(cls, project_id):
        if(len(project_id) == 0):
            print("!@!#!")
            sql= """select station_seq, station_name, station_id from tbl_station
                    where use_yn ='Y'
                    and station_id not in (SELECT station_id FROM tbl_monitoring
                   WHERE monitoring_date > now() - INTERVAL 10 MINUTE
                   group by station_id);
                    """
        else:
      
            sql= """select station_seq, station_name, station_id from tbl_station 
                    where station_seq in (select station_seq from tbl_location_station
                    where location_id in (select location_id from tbl_location
                    where project_id = '"""+project_id+"""'  and use_yn = 'Y')  and use_yn = 'Y')
                    and station_id not in (SELECT station_id FROM tbl_monitoring
                    WHERE monitoring_date > now() - INTERVAL 10 MINUTE
                    group by station_id);
                    """

        print(sql)
        return db.engine.execute(text(sql))
    

class monitoring60Model(db.Model):
    __tablename__ = 'tbl_monitoring60'

    monitoring_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)     # 로우데이터 아이디 
    station_id = db.Column(db.String(45), primary_key=True)                            # 스테이션 아이디 
    monitoring_base = db.Column(db.String(45), nullable=False)                         # 베이스 아이디
    monitoring_mon = db.Column(db.String(45), nullable=False)                          # 로버 아이디
    monitoring_E = db.Column(db.Float, nullable=False)                                 # 동쪽
    monitoring_N = db.Column(db.Float, nullable=False)                                 # 서쪽
    monitoring_U = db.Column(db.Float, nullable=False)                                 # 고도
    monitoring_X = db.Column(db.Float, nullable=False)                                 # WGS84 X
    monitoring_Y = db.Column(db.Float, nullable=False)                                 # WGS84 Y
    monitoring_Z = db.Column(db.Float, nullable=False)                                 # WGS84 Z
    monitoring_fix = db.Column(db.Float, nullable=False)                               # WGS84 Z
    monitoring_checksum = db.Column(db.Float, nullable=False)                          # WGS84 Z
    
    monitoring_date = db.Column(db.DateTime, nullable=False)
    create_date = db.Column(db.DateTime,  default=datetime.now())
   

    def __init__(self, monitoring_id, station_id, monitoring_base, monitoring_mon, 
                      monitoring_E, monitoring_N, monitoring_U, monitoring_X, monitoring_Y, monitoring_Z, monitoring_fix, monitoring_checksum, monitoring_date, create_date):

        self.monitoring_id = monitoring_id
        self.station_id = station_id
        self.monitoring_base = monitoring_base
        self.monitoring_mon = monitoring_mon
        self.monitoring_E = monitoring_E
        self.monitoring_N = monitoring_N
        self.monitoring_U = monitoring_U
        self.monitoring_X = monitoring_X
        self.monitoring_Y = monitoring_Y
        self.monitoring_Z = monitoring_Z
        self.monitoring_fix = monitoring_fix
        self.monitoring_checksum = monitoring_checksum
        self.monitoring_date = monitoring_date
        self.create_date = create_date

    @classmethod
    def find_by_id(cls, monitoring_id):
        return cls.query.filter_by(monitoring_id=monitoring_id).first()

    @classmethod
    def find_by_id_all(cls, monitoring_id):
        return cls.query.filter_by(monitoring_id=monitoring_id).all()

    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()