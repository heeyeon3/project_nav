#-*- coding:utf-8 -*-

from core.db                import db
from flask_restful          import Api
from flask                  import Flask, session, render_template, jsonify
from flask_jwt_extended     import JWTManager
from config.configuration   import Configuration
from dateutil.relativedelta import *
from datetime               import timedelta
from flask_login            import LoginManager, login_required
from resource.user          import * #UserLogin, UserLogout
# from resource.auth        import * #Auth, AppAuth       0824 code delete
from resource.project       import project, projectlist, project_Edit_button, manual
from resource.location      import * 
from resource.station       import stationlist, find_user_project, station, station_Edit_button, location_station_list
from resource.monitoring    import monitoring, data_file, ExcelDown, stationmap, stationmonitoring, date_tooltip_monitoring,date_tooltip_satellite, datastatus, datastatus_user, Excel
from resource.satellite     import station_satellite_monitoring
from resource.excel         import exceldown

from apscheduler.schedulers.background import BackgroundScheduler



# Flask Init App
app = Flask(__name__)


# SQLITE and secret Config
app.config.from_object(Configuration)
# app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
# app.config["REMEMBER_COOKIE_DURATION"] = timedelta(minutes=30)
# app.config['SQLALCHEMY_POOL_RECYCLE'] = <db_wait_timeout> - 1
app.config['SQLALCHEMY_POOL_RECYCLE'] = 499
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 20


# JWT Set
jwt = JWTManager(app)

# APP Set
api = Api(app)

# DataBase Init
db.init_app(app)

# DB Table creation test.
with app.app_context():
     db.create_all()
    # print("NEW DB Tables created (Not exist only created !!)")

# Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/"
login_manager.needs_refresh_message = (u"Session timedout, please re-login")
login_manager.needs_refresh_message_category = "info"

@app.before_request
def before_request():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=300)
    app.config["REMEMBER_COOKIE_DURATION"] = timedelta(minutes=300)

@login_manager.user_loader
def user_loader(user_id):
    return UserModel.find_by_id(user_id)


# ######################################################################################################################
# INTRO PAGE and LOGIN API 모음
# ######################################################################################################################
@app.route('/')
def main():

    return render_template('/did/login.html')

api.add_resource(UserLogin,     '/web/login', endpoint='web/login')                                 # CMS 로그인   method:post
api.add_resource(UserLogout,    '/web/logout', endpoint='web/logout')                               # CMS 로그아웃  method:post
api.add_resource(firstuser,     '/user/first', endpoint='user/first')

# ######################################################################################################################
# Project_list 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Project_list')
@login_required
def Project_list_main():

    return render_template('/did/Project_list.html')

# API
api.add_resource(projectlist,     '/project/search', endpoint='project/search') 

# ######################################################################################################################
# Project_create 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Project_create')
@login_required
def Project_create_main():

    return render_template('/did/Project_create.html')

# API
api.add_resource(project,               '/project/add', endpoint='project/add')   
api.add_resource(project_Edit_button,   '/project/edit/selected', endpoint='project/edit/selected')         #Edit 버튼 클릭시 데이터 가져오기

# ######################################################################################################################
# Location_list 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Location_list')
@login_required
def Location_list_main():

    return render_template('/did/Location_list.html')

api.add_resource(locationlist,     '/location/search', endpoint='location/search') 

# ######################################################################################################################
# Location_create 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Location_create')
@login_required
def Location_create_main():

    return render_template('/did/Location_create.html')


api.add_resource(projectlist,           '/projectlist/add', endpoint='/projectlist/add')
api.add_resource(location,              '/location/add', endpoint='/location/add')
api.add_resource(location_Edit_button,  '/location/edit/selected', endpoint='location/edit/selected') 

# ######################################################################################################################
# Station_list 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Station_list')
@login_required
def Station_list_main():

    return render_template('/did/Station_list.html')

api.add_resource(stationlist,     '/station/search', endpoint='station/search') 
api.add_resource(find_user_project,     '/finduser/project', endpoint='finduser/project') 


# ######################################################################################################################
# Station_create 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Station_create')
@login_required
def Station_create_main():

    return render_template('/did/Station_create.html')

api.add_resource(locationlist,          '/locationlist/add', endpoint='/locationlist/add')
api.add_resource(station,               '/station/add', endpoint='/station/add')
api.add_resource(station_Edit_button,   '/station/edit/selected', endpoint='station/edit/selected')   

# ######################################################################################################################
# Monitoring01 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Monitoring01')
@login_required
def Monitoring01_main():

    return render_template('/did/Monitoring01.html')

# api.add_resource(location_station_list,     '/location/station/list', endpoint='location/station/list')
api.add_resource(stationmap,     '/station/mapinfo', endpoint='station/mapinfo') 
# api.add_resource(stationmap,     '/monitoring/search', endpoint='monitoring/search') 
api.add_resource(datastatus,     '/station/datastatus', endpoint='station/datastatus')
api.add_resource(datastatus_user,     '/station/datastatus/user', endpoint='station/datastatus/user')

# ######################################################################################################################
# Monitoring02 및 API 모음 스테이션데이터 상세
# ######################################################################################################################

# 페이지
@app.route('/Monitoring02')
@login_required
def Monitoring02_main():

    return render_template('/did/Monitoring02.html')
api.add_resource(monitoring,     '/monitoring/data', endpoint='monitoring/data') #데이터 받기
api.add_resource(stationmonitoring,     '/monitoring/station/data', endpoint='monitoring/station/data') #데이터 받기

# ######################################################################################################################
# Monitoring02 및 API 모음 위성데이터 상세
# ######################################################################################################################

# 페이지
@app.route('/Monitoring03')
@login_required
def Monitoring03_main():

    return render_template('/did/Monitoring03.html')


api.add_resource(station_satellite_monitoring,     '/monitoring/station/satellite', endpoint='monitoring/station/satellite') #데이터 받기


# ######################################################################################################################
# Data01 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/Data01')
@login_required
def Data01_main():

    return render_template('/did/Data01.html')


# api.add_resource(data_file,     '/data/select', endpoint='data/select') #데이터 받기
api.add_resource(Excel,     '/data/download', endpoint='data/download') #데이터 받기
# api.add_resource(ExcelDown,     '/data/download', endpoint='data/download') #데이터 받기
api.add_resource(date_tooltip_monitoring,     '/date/tooltip/monitoring', endpoint='data/tooltip/monitoring') #데이터 툴팁
api.add_resource(date_tooltip_satellite,     '/date/tooltip/satellite', endpoint='data/tooltip/satallite') #데이터 툴팁


# ######################################################################################################################
# User_list 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/User_list')
@login_required
def User_list_main():

    return render_template('/did/User_list.html')

api.add_resource(userlist,              '/user/search', endpoint='user/search')
api.add_resource(current_user_info,     '/user/currentfind', endpoint='user/currentfind')


# ######################################################################################################################
# User_create 및 API 모음
# ######################################################################################################################

# 페이지
@app.route('/User_create')
@login_required
def User_create_main():

    return render_template('/did/User_create.html')


api.add_resource(User,              '/user/add', endpoint='/user/add')
api.add_resource(user_Edit_button, '/user/edit/selected', endpoint='user/edit/selected') 


def excelload():
    print("EXCEL DOWN...........................")
    exceldownObj = exceldown()
    return_value = exceldownObj.exceldownload()
    if(return_value):
        print(exceldownObj)



job_defaults = {
    'coalesce': False,
    'max_instances': 30,
}
scheduler = {'apscheduler.timezone': 'Asia/Seoul'}
sched = BackgroundScheduler({ 'apscheduler.job_defaults.coalesce': 'false', 'apscheduler.job_defaults.max_instances': '30', 'apscheduler.timezone': 'UTC'})

# sched.start()
# sched.add_job(excelload,        'interval', seconds=10, id="naverBlog")


@app.after_request
def add_security_headers(resp):
    resp.headers['X-XSS-Protection'] = '1; mode=block'
    return resp

# ######################################################################################################################
# APP RUN
# ######################################################################################################################
if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000)
    # app.run(ssl_context=("cert.pem", "key.pem"),  host='0.0.0.0', port=5000)