from datetime import datetime
from core.db import db
from sqlalchemy.sql import text


class LocationStationModel(db.Model):
    __tablename__ = 'tbl_location_station'

    group_seq = db.Column(db.BigInteger, primary_key=True, autoincrement=True)    # 그룹 순번
    location_id = db.Column(db.BigInteger, nullable = False )    # 그룹 순번
    station_seq = db.Column(db.BigInteger, nullable = False)  # 가맹점 순번
    use_yn = db.Column(db.String(1), nullable = False, default = 'Y')  # 가맹점 순번
    create_date = db.Column(db.DateTime)
    modify_date = db.Column(db.DateTime)

    def __init__(self, location_id, station_seq, use_yn, create_date, modify_date):

        self.location_id = location_id
        self.station_seq = station_seq
        self.use_yn = use_yn
        self.create_date = create_date
        self.modify_date = modify_date

    @classmethod
    def find_by_id(cls, location_id, station_seq):
        return cls.query.filter_by(location_id=location_id, station_seq=station_seq).first()

    


    # save
    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    # delete
    def delete_to_db(self):
        db.session.delete(self)
        db.session.commit()

