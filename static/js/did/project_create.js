var data_status_user;
var not_data_list ="";

$(function(){

    var url = new URL(window.location.href);
    const urlParams = url.searchParams;
    
    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	 }, 30000);



     $("#project_name, #description, #company").keyup(function(e) {
        console.log("!")
       this.value = this.value.replace(/^ /gi, '')
    });

    $("#project_name, #description, #company").keyup(function(e) {
        // var regex = /^[a-zA-Z0-9@]+$/;
        var RegExp = /[\{\}\[\]\/?;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;	//정규식 구문
            if (RegExp.test(this.value)) {
            // 특수문자 모두 제거    
            this.value =this.value.replace(RegExp , '');
            }

        
    });

    // URLSearchParams.get()
    var type =    urlParams.get('type');
    var project_id =  urlParams.get('project_id');
    if(type == 'add'){
        $('#btn_edit').hide()
        $('#btn_delete').hide()
    } else if(type == 'edit'){
        $('#btn_add').hide()
        $('#btn_delete').hide()

        $.ajax({
            type: "GET",
            url: "/project/edit/selected?project_id="+project_id,
            async : false,
            success : function(json) {
                var edit_data = JSON.parse(json.data);
                $("#project_name").val(edit_data.project_name)
                $("#description").val(edit_data.project_description)
                $("#company").val(edit_data.project_company)
            },
            error: function(json){
                alert("station edit_btn error")
            }
        });

    }

    
    
    $("#btn_add").click(function() {
        var project_name   =                 $("#project_name").val().trim()
        var description   =                  $("#description").val().trim()
        var company =                        $("#company").val()

        // 유효성체크
        if(project_name == ""){
            alert("project_name 입력해주세요.");
            $("#project_name").focus();
            return;
        }else if(description == ""){
            alert("description 입력해주세요.");
            $("#description").focus();
            return;
        }else if(company == ""){
            alert("company 입력해주세요.");
            $("#company").focus();
            return;
        }else if(project_name.length > 25){
            alert("PROJECT NAME 25자 이하로 입력해주세요.");
            $("#project_name").focus();
            return;
        }else if(company.length > 25){
            alert("COMPANY 25자 이하로 입력해주세요.");
            $("#company").focus();
            return;
        }


    
        $.ajax({
            url : "/project/add",
            data: {
                "project_name" : project_name,
                "project_description" : description,
                "project_company" : company,
                "use_yn" : 'Y'
            },
            type: "POST",
            async : false,
            // contentType: false,
            // processData: false,
            beforeSend: function() {

            },
            error:function(error){
                alert(error.resultString);
                console.log(error.resultString)

            },
            success:function(data) {
                if(data.resultCode == 100){
                    alert(data.resultString);

                }else{
                    alert(data.resultString);
                    location.href='Project_list'
                }
                

            }
        });

        
    });

    $("#btn_edit").click(function() {
        
        var project_name   =                 $("#project_name").val().trim()
        var description   =                  $("#description").val().trim()
        var company =                        $("#company").val()
     
        // 유효성체크
        if(project_name == ""){
            alert("project_name 입력해주세요.");
            $("#project_name").focus();
            return;
        }else if(description == ""){
            alert("description 입력해주세요.");
            $("#description").focus();
            return;
        }else if(company == ""){
            alert("company 입력해주세요.");
            $("#company").focus();
            return;
        }else if(project_name.length > 25){
            alert("PROJECT NAME 25자 이하로 입력해주세요.");
            $("#project_name").focus();
            return;
        }else if(company.length > 25){
            alert("COMPANY 25자 이하로 입력해주세요.");
            $("#company").focus();
            return;
        }


    
        $.ajax({
            url : "/project/add",
            data: {
                "project_id" : project_id,
                "project_name" : project_name,
                "project_description" : description,
                "project_company" : company,
                "use_yn" : 'Y'
            },
            type: "PUT",
            async : false,
            beforeSend: function() {

            },
            error:function(error){
                alert(error.resultString);
                console.log(error.resultString)

            },
            success:function(data) {
                if(data.resultCode == 100){
                    alert(data.resultString);

                }else{
                    alert(data.resultString);
                    location.href='Project_list'
                }
               

            }
        });

        
    });

})

function clickadd() {
    if ($("#project_name").val().length == 0) {
        alert("Project name을 입력해 주세요.")
    } 
    else if ($("#description").val().length == 0) {
        alert("description을 입력해 주세요")
    }
    else if ($("#company").val().length == 0){
        alert("company를 입력해 주세요")
    }
    else {
        alert("데이터 추가한다")

    }
}

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