var edit_data = '';
var projectlist_name = '';

var data_status_user;
var not_data_list ="";


$(function(){
    // URLSearchParams 객체
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;
    var location_id =  urlParams.get('location_id');
    // URLSearchParams.get()
    var type =    urlParams.get('type');
    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	 }, 30000);

//      $("#location_name").keyup(function(e) {
//         console.log("!")
//        this.value = this.value.replace(/^ /gi, '')
//    });

    $("#location_name,  #description").keyup(function(e) {
        console.log("!")
        this.value = this.value.replace(/^ /gi, '')
    });

    $("#description, #location_name").keyup(function(e) {
        // var regex = /^[a-zA-Z0-9@]+$/;
        var RegExp = /[\{\}\[\]\/?;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;	//정규식 구문
            if (RegExp.test(this.value)) {
              // 특수문자 모두 제거    
              this.value =this.value.replace(RegExp , '');
            }
    });

    //project select 
    $.ajax({
        type: "GET",
        url: "/projectlist/add?status=1000",
        async : false,
        success : function(json) {
            // console.log(json.data)
            projectlist_name = json.data

        },
        error: function(json){
            alert("프로젝트 조회 오류")
        }
    });

    for(var i = 0; i < projectlist_name.length; i++){
        $("#selectBox").append('<option value='+projectlist_name[i].project_id+'>'+projectlist_name[i].project_name+'</option>');
    }

    // add, edit 구별
    if(type == 'add'){
        $('#btn_edit').hide()
        $('#btn_delete').hide()
    } else if(type == 'edit'){
        $('#btn_add').hide()
        $('#btn_delete').hide()

        $.ajax({
            type: "GET",
            url: "/location/edit/selected?location_id="+location_id,
            async : false,
            success : function(json) {
                edit_data = JSON.parse(json.data);
                
                $("#location_name").val(edit_data.location_name)
                $("#selectBox").val(edit_data.project_id).prop("selected", true )
                $("#description").val(edit_data.location_description)
            },
            error: function(json){
                alert("location edit_btn error")
            }
        });
    }


    
    // add 버튼 클릭시 데이터 추가 
    $("#btn_add").click(function(){

        var location_name   =                 $("#location_name").val().trim()
        var description   =                   $("#description").val().trim()
        var project_id   =                   $("#selectBox option:selected").val()

        // 유효성체크
        if(location_name == ""){
            alert("location_name 입력해주세요.");
            $("#location_name").focus();
            return;
        }else if(description == ""){
            alert("description 입력해주세요.");
            $("#description").focus();
            return;
        }else if(project_id == "all"){
            alert("project 선택해주세요.");  
            return;
        }else if(location_name.length > 25){
            alert("LOCATION NAME 25자 이하로 입력해주세요.");
            $("#location_name").focus();
            return;
        }

        $.ajax({
            url : "/location/add",
            data: {
                "location_name" : location_name,
                "location_description" : description,
                "use_yn" : 'Y',
                "project_id" : project_id
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
                if(data.resultCode==100){
                    alert(data.resultString);
                }else{
                    alert(data.resultString);
                    location.href='Location_list'
                }
                
    
            }
        });
    })

    $("#btn_edit").click(function() {
        var location_id   =                 edit_data.location_id
      
        var location_name   =                 $("#location_name").val().trim()
        var description   =                   $("#description").val().trim()
        var project_id   =                   $("#selectBox option:selected").val()
        // 유효성체크
        if(location_name == ""){
            alert("location_name 입력해주세요.");
            $("#location_name").focus();
            return;
        }else if(description == ""){
            alert("description 입력해주세요.");
            $("#description").focus();
            return;
        }else if(project_id == "all"){
            alert("project 선택해주세요.");
            
            return;
        }else if(location_name.length > 25){
            alert("LOCATION NAME 25자 이하로 입력해주세요.");
            $("#location_name").focus();
            return;
        }

        console.log(project_id)
        $.ajax({
            url : "/location/add",
            data: {
                "location_id" : location_id,
                "location_name" : location_name,
                "location_description" : description,
                "use_yn" : 'Y',
                "project_id" : project_id
            },
            type: "PUT",
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
                if(data.resultCode==100){
                    alert(data.resultString);
                }else{
                    alert(data.resultString);
                    location.href='Location_list'
                }
                
    
            }
        });

        
    });
    
})

function check_data_null_user(){
    $.ajax({
        type: "GET",
        url: "/station/datastatus/user?status=1000",
        // async: false,
        success : function(json) {
            console.log(json);
            data_status_user = json.data;
         
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