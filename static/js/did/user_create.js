var current_user_gr = "";

var data_status_user;
var not_data_list ="";

$(function(){
    // URLSearchParams 객체
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;
    // URLSearchParams.get()
    var type =    urlParams.get('type');
    var user_id =    urlParams.get('user_id');

    var projectlist_name = ""
    //************************************ID,PW 한글 입력 막기***************************

    // $("#user_pwd").on("blur keyup", function() {
    //     $(this).val( $(this).val().replace( /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '' ) );
    // });

    // $("#user_id").keyup(function(e) {
    //     var regex = /^[a-zA-Z0-9@]+$/;
    //     if (regex.test(this.value) !== true)
    //       this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    // });

    $("#user_nm, #user_id").keyup(function(e) {
        var regex = /^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9@]+$/;
        if (regex.test(this.value) !== true)
          this.value = this.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9@]+/, '');
    });



    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	 }, 30000);

	

    //project select 
    $.ajax({
        type: "GET",
        url: "/projectlist/add?status=1000",
        async : false,
        success : function(json) {
            // console.log(json.data)
            projectlist_name = json.data
            console.log(projectlist_name)

        },
        error: function(json){
            alert("프로젝트 조회 오류")
        }
    });
    
    for(var i = 0; i < projectlist_name.length; i++){
        $("#selectBox").append('<option value='+projectlist_name[i].project_id+'>'+projectlist_name[i].project_name+'</option>');
    }

    $.ajax({
        url : "/user/currentfind?status=1000",
        data: {
            
        },
        type: "GET",
        async : false,
        beforeSend: function() {

        },
        error:function(error){
            alert(error.resultString);
            console.log(error.resultString)

        },
        success:function(json) {
            var edit_data = JSON.parse(json.data);
            console.log(edit_data)
            current_user_id = edit_data.user_id
            current_user_gr = edit_data.user_gr
            current_user_project_id = edit_data.project_id
        }
    });

    console.log(current_user_gr,"current_user_gr")


    if(current_user_gr == '0103'){
        $('#program_manager').hide()
    }
    
    
    //type별 버튼 생성
    if(type == 'add'){
        $('#btn_edit').hide()
        $('#btn_delete').hide()
    } else if(type == 'edit'){
        $('#btn_add').hide()
        $('#btn_delete').hide()
        
        document.getElementById('user_id').readOnly = true
        $.ajax({
            type: "GET",
            url: "/user/edit/selected?user_id="+user_id,
            async : false,
            success : function(json) {
                edit_data = json.data;
                console.log(edit_data)
                
                $("#user_id").val(edit_data[0].user_id)
                // $("#user_pwd").val(edit_data[0].user_pwd)
                $("#user_nm").val(edit_data[0].user_nm)
                $("#selectBox").val(edit_data[0].project_id).prop("selected", true )
                $("#selectBox_grade").val(edit_data[0].user_gr).prop("selected", true )

                if(edit_data[0].user_gr == '0102' || edit_data[0].user_gr == '0101'){
                    $('#project_input_row').hide()
                }
                if(edit_data[0].user_gr == '0101'){
                    $('#project_input_row').hide()
                    $('#selectBox_grade').hide()
                    $('#LEVEL').hide()
                }
                
                if(edit_data[0].user_fail_count && parseInt(edit_data[0].user_fail_count) >= 5 && current_user_gr == '0101'){
                   console.log("!!!!!!!!!!!!!")
                    $('#pwd_lock_row').show()
                }
        
                $("#user_email").val(edit_data[0].user_email)
            },
            error: function(json){
                alert("user edit_btn error")
            }
        });
    }

    $('#selectBox_grade').change(function(){
        console.log("!@3")
        var select_level = $("#selectBox_grade").val()
        console.log(select_level)
        if(select_level == '0102'){
            $("#selectBox").val("all").prop("selected", true);
            $("#project_input_row").hide()
        }else{
            $("#selectBox").val("all").prop("selected", true);
            $("#project_input_row").show()
        }
    })

    
    // console.log(projectlist_name[0].project_name)
    // console.log(projectlist_name.length)

    
    

    // add 버튼 클릭시 데이터 추가 
    $("#btn_add").click(function(){

        var user_id   =                    $("#user_id").val()
        var user_pwd   =                   $("#user_pwd").val()
        var user_re_pwd   =                $("#user_re_pwd").val()
        var user_nm   =                    $("#user_nm").val()
        var user_email   =                 $("#user_email").val()
        var user_gr   =                    $("#selectBox_grade option:selected").val()
        var project_id   =                 $("#selectBox option:selected").val()
        // 유효성체크
        var num = user_pwd.search(/[0-9]/g);
        var eng = user_pwd.search(/[a-z]/ig);
        var spe = user_pwd.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
        var kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
       
        if(user_id == ""){
            alert("ID 입력해주세요.");
            $("#user_id").focus();
            return;
        } else if(user_id.length < 4){
            // 결함리포트 (4 - 4)
            alert("ID는 4자 이상입니다");
            $("#user_id").focus();
            return;
        } else if(kor.test(user_id)){
            alert("ID는 한글이 포함될 수 없습니다.");
            $("#user_id").focus();
            return;
        } else if(user_pwd.search(/\s/) != -1){
            alert("비밀번호는 공백 없이 입력해주세요.");
            return false;
        }else if(num < 0 || eng < 0 || spe < 0 ){
            alert("비밀번호는 영문, 숫자, 특수문자를 혼합하여 입력해주세요.");
            return false;
        }else if(user_pwd == ""){
            alert("PASSWORD 입력해주세요.");
            $("#user_pwd").focus();
            return;
        }else if(!chkPW(user_pwd)){
            return;
        }else if(user_re_pwd != user_pwd ){
            alert("비밀번호, 비밀번호 체크가 일치하지 않습니다.");
            $("#user_pwd").focus();
            return;
        }else if(user_gr == "all"){
            alert("LEVEL을 선택해주세요.");
            $("#user_gr").focus();
            return;
        }else if(project_id == "all" & user_gr !="0102"){
            alert("PROJECT를 선택해주세요.");
            $("#project_id").focus();
            return;
        }else if(user_id.length > 20 ){
            alert("ID 20자 이하로 입력해 주세요.");
            $("#user_id").focus();
            return;
        }else if(user_nm.length > 10 ){
            alert("NAME 10자 이하로 입력해 주세요.");
            $("#user_nm").focus();
            return;
        }else if(user_email.length > 100 ){
            alert("email 100자 이하로 입력해 주세요.");
            $("#user_email").focus();
            return;
        }

        if(user_email.length > 0  && !email_check(user_email)){
            alert("이메일 형식을 맞춰 주세요.");
            $("#user_email").focus();
            return;
        }
       
        if(user_gr == '0102'){
            project_id = ''
        }

        user_pwd = CryptoJS.SHA256(user_pwd);
        // user_pwd_256 = sha256(user_pwd);
        console.log(user_pwd)
        // console.log(user_pwd_256)
        $("#user_pwd").val(user_pwd);
        
        var form_data = new FormData();
        form_data.append("user_id", user_id);
        form_data.append("user_pwd", user_pwd);
        form_data.append("user_nm", user_nm);
        form_data.append("user_email", user_email);
        form_data.append("user_gr", user_gr);
        form_data.append("user_yn", "Y");
        form_data.append("project_id", project_id);
        console.log("project_id")

        $.ajax({
            url : "/user/add",
            data: form_data,
            type: "POST",
            async : false,
            contentType: false,
            processData: false,
            beforeSend: function() {

            },
            error:function(error){
                alert(error.resultString);
                console.log(error.resultString)
    
            },
            success:function(data) {
                if(data.resultCode==100){
                    alert(data.resultString);
                }else{
                    alert(data.resultString);
                    location.href='User_list'
                }
               

            }
        });
    })
    

    $('#btn_edit').click(function(){

        var user_id   =                    $("#user_id").val()
        var user_pwd   =                   $("#user_pwd").val()
        var user_re_pwd   =                $("#user_re_pwd").val()
        var user_nm   =                    $("#user_nm").val()
        var user_email   =                 $("#user_email").val()
        var user_gr   =                    $("#selectBox_grade option:selected").val()
        var project_id   =                 $("#selectBox option:selected").val()
        // 유효성체크
        var pwd_lock   =                   $("#selectBox_lock option:selected").val()
        // var pw = $("#user_pwd").val();
        var num = user_pwd.search(/[0-9]/g);
        var eng = user_pwd.search(/[a-z]/ig);
        var spe = user_pwd.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
       
        if(!user_gr && user_id == 'admin' ){
            user_gr = '0101'
        }

   

        if(user_id == ""){
            alert("ID 입력해주세요.");
            $("#user_id").focus();
            return;
        } else if(user_id.length < 4){
            // 결함리포트 (4 - 4)
            alert("ID는 4자 이상입니다");
            $("#user_id").focus();
            return;
        } else if(user_pwd.search(/\s/) != -1){
            alert("비밀번호는 공백 없이 입력해주세요.");
            return false;
        }else if(num < 0 || eng < 0 || spe < 0 ){
            alert("비밀번호는 영문, 숫자, 특수문자를 혼합하여 입력해주세요.");
            return false;
        }else if(user_pwd == ""){
            alert("PASSWORD 입력해주세요.");
            $("#user_pwd").focus();
            return;
        }else if(!chkPW(user_pwd)){
            return;
        }else if(user_re_pwd != user_pwd ){
            alert("비밀번호, 비밀번호 체크가 일치하지 않습니다.");
            $("#user_pwd").focus();
            return;
        }else if(user_gr == "all"){
            alert("LEVEL을 선택해주세요.");
            $("#user_gr").focus();
            return;
        }else if(project_id == "all" & user_gr !="0102"){
            alert("PROJECT를 선택해주세요.");
            $("#project_id").focus();
            return;
        }else if(user_id.length > 20 ){
            alert("ID 20자 이하로 입력해 주세요.");
            $("#user_id").focus();
            return;
        }else if(user_nm.length > 10 ){
            alert("NAME 10자 이하로 입력해 주세요.");
            $("#user_nm").focus();
            return;
        }else if(user_email.length > 100 ){
            alert("email 100자 이하로 입력해 주세요.");
            $("#user_email").focus();
            return;
        }

        if(user_email.length > 0  && !email_check(user_email)){
            alert("이메일 형식을 맞춰 주세요.");
            $("#user_email").focus();
            return;
        }
       
        if(project_id=="all"){
            project_id = ""
        }
        if(user_gr == '0102'){
            project_id = ''
        }


        console.log("@")
        $('#btn_edit').hide()
        $('#btn_reedit').show()


        $("#user_id_row").hide()
        $("#uesr_pwd_row").hide()
        $("#user_re_pwd_row").hide()
        $("#user_nm_row").hide()
        $("#user_email_row").hide()
        $("#project_input_row").hide()
        $("#program_manager_row").hide()
        $("#pwd_lock_row").hide()
        $('#pwd_check_row').show()
    })


    // edit 버튼 클릭시 데이터 수정 
    $("#btn_reedit").click(function(){

        var user_id   =                    $("#user_id").val()
        var user_pwd   =                   $("#user_pwd").val()
        var user_re_pwd   =                $("#user_re_pwd").val()
        var user_nm   =                    $("#user_nm").val()
        var user_email   =                 $("#user_email").val()
        var user_gr   =                    $("#selectBox_grade option:selected").val()
        var project_id   =                 $("#selectBox option:selected").val()
        var pwd_check   =                  $("#pwd_check").val()
        var pwd_lock   =                   $("#selectBox_lock option:selected").val()
        // 유효성체크
        // var pw = $("#user_pwd").val();
        var num = user_pwd.search(/[0-9]/g);
        var eng = user_pwd.search(/[a-z]/ig);
        var spe = user_pwd.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
       
        if(!user_gr && user_id == 'admin' ){
            user_gr = '0101'
        }

   

        if(user_id == ""){
            alert("ID 입력해주세요.");
            $("#user_id").focus();
            return;
        } else if(user_id.length < 4){
            // 결함리포트 (4 - 4)
            alert("ID는 4자 이상입니다");
            $("#user_id").focus();
            return;
        } else if(user_pwd.search(/\s/) != -1){
            alert("비밀번호는 공백 없이 입력해주세요.");
            return false;
        }else if(num < 0 || eng < 0 || spe < 0 ){
            alert("비밀번호는 영문, 숫자, 특수문자를 혼합하여 입력해주세요.");
            return false;
        }else if(user_pwd == ""){
            alert("PASSWORD 입력해주세요.");
            $("#user_pwd").focus();
            return;
        }else if(!chkPW(user_pwd)){
            return;
        }else if(user_re_pwd != user_pwd ){
            alert("비밀번호, 비밀번호 체크가 일치하지 않습니다.");
            $("#user_pwd").focus();
            return;
        }else if(user_gr == "all"){
            alert("LEVEL을 선택해주세요.");
            $("#user_gr").focus();
            return;
        }else if(project_id == "all" & user_gr !="0102"){
            alert("PROJECT를 선택해주세요.");
            $("#project_id").focus();
            return;
        }else if(user_id.length > 20 ){
            alert("ID 20자 이하로 입력해 주세요.");
            $("#user_id").focus();
            return;
        }else if(user_nm.length > 10 ){
            alert("NAME 10자 이하로 입력해 주세요.");
            $("#user_nm").focus();
            return;
        }else if(user_email.length > 100 ){
            alert("email 100자 이하로 입력해 주세요.");
            $("#user_email").focus();
            return;
        }

        if(user_email.length > 0  && !email_check(user_email)){
            alert("이메일 형식을 맞춰 주세요.");
            $("#user_email").focus();
            return;
        }
       
        if(project_id=="all"){
            project_id = ""
        }
        if(user_gr == '0102'){
            project_id = ''
        }


        user_pwd = CryptoJS.SHA256(user_pwd);
        pwd_check = CryptoJS.SHA256(pwd_check);
        // user_pwd_256 = sha256(user_pwd);
        console.log(user_pwd)
        // console.log(user_pwd_256)
        $("#user_pwd").val(user_pwd);
        
        var form_data = new FormData();
        form_data.append("user_id", user_id);
        form_data.append("user_pwd", user_pwd);
        form_data.append("user_nm", user_nm);
        form_data.append("user_email", user_email);
        form_data.append("user_gr", user_gr);
        form_data.append("user_yn", "Y");
        form_data.append("project_id", project_id);
        form_data.append("current_user_pwd", pwd_check);
        form_data.append("pwd_lock", pwd_lock);
        console.log("project_id")

        $.ajax({
            url : "/user/add",
            data: form_data,
            type: "PUT",
            async : false,
            contentType: false,
            processData: false,
            beforeSend: function() {

    
            },
            error:function(error){
                alert(error.resultString);
                console.log(error.resultString)
    
            },
            success:function(data) {
                if(data.resultCode==100){
                    alert(data.resultString);
                }else{
                    alert(data.resultString);
                    location.href='User_list'
                }
                
    
            }
        });
    })
})


function check_data_null_user(){
    $.ajax({
        type: "GET",
        url: "/station/datastatus/user?status=1000",
        // async: false,
        success : function(json) {
            console.log(json);
            data_status_user = json.data;
            console.log(data_status_user);
			not_data_list = ""
			for(let i=0; i < data_status_user.length; i++){
				not_data_list += " "+ data_status_user[i].station_name
			}
			$('#data_status').text(not_data_list)
			$('#marquee').addClass('marquee')
			
        },
        error: function(json){
            console.log("긴급에러")
            console.log(json)
        }
    });

	
}


function chkPW(){

    var pw = $("#user_pwd").val();
    var num = pw.search(/[0-9]/g);
    var eng = pw.search(/[a-z]/ig);
    var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
   
    if(pw.length < 8 || pw.length > 20){
   
     alert("비밀번호는 8자리 ~ 20자리 이내로 입력해주세요.");
     return false;
    }else if(pw.search(/\s/) != -1){
     alert("비밀번호는 공백 없이 입력해주세요.");
     return false;
    }else if(num < 0 || eng < 0 || spe < 0 ){
     alert("영문,숫자, 특수문자를 혼합하여 입력해주세요.");
     return false;
    }else {
       console.log("통과"); 
       return true;
    }
   
   }


   function email_check(email) {

	var reg = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
	// let emailch = reg.test(email)
	// if(!emailch){
	// 	alert("이메일 형식을 맞춰주세요")
	// 	return true;
	// }
	console.log(reg.test(email))

	return reg.test(email);

}