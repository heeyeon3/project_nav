
let location_id_1 = "";
let station_seq = "";

var data_status_user;
var not_data_list ="";

$(function(){
    // URLSearchParams 객체
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;
    var station_id =  urlParams.get('station_id');
    // URLSearchParams.get()
    var type =    urlParams.get('type');

    //select box 
    //project select  
    var projectlist_name = ""

    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	 }, 30000);

    $("#station_id").keyup(function(e) {
    var regex = /^[a-zA-Z0-9@]+$/;
    if (regex.test(this.value) !== true)
        this.value = this.value.replace(/[^a-zA-Z0-9@]+/, '');
    });

    $("#station_name").keyup(function(e) {
        var regex = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-zA-Z0-9@]+$/;
        if (regex.test(this.value) !== true)
            this.value = this.value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-zA-Z0-9@]+/, '');
    });

    //   $("#station_name").keyup(function(e) {
    //     this.value = this.value.replace(/^ /gi, '')
    //   });

    
     
    
    $.ajax({
        type: "GET",
        url: "/projectlist/add?status=1000",
        async : false,
        success : function(json) {
            // console.log(json.data)
            projectlist_name = json.data
            for(var i = 0; i < projectlist_name.length; i++){
                $("#selectBox01").append('<option value='+projectlist_name[i].project_id+'>'+projectlist_name[i].project_name+'</option>');
            }

        },
        error: function(json){
            alert("프로젝트 조회 오류")
        }
    });
    
    //location select 
    $("#selectBox01").on( "change", function() {
        $("#selectBox02").empty()
        $("#selectBox02").append("<option value='all'>location 입력해주세요</option>")
        var select_0 = $("#selectBox01 option:selected").val();
        console.log(select_0)
        if(select_0 != "all"){
            project_select(select_0);
            $("#selectBox02").show(); 
            console.log($("#selectBox02").val() )
                   
        } else{
            $("#selectBox02").val("all").prop("selected", true);        
        }
    });

    // 버튼 타입별 분기
    if(type == 'add'){
        $('#btn_edit').hide()
        $('#btn_delete').hide()

        $("#station_udp1").val('65001')
        $("#station_udp2").val('65003')
        $("#station_udp3").val('65005')

    } else if(type == 'edit'){
        $('#btn_add').hide()
        $('#btn_delete').hide()
        // document.getElementById('station_id').readOnly = true
        $.ajax({
            type: "GET",
            url: "/station/edit/selected?station_id="+station_id,
            async : false,
            success : function(json) {
                edit_data = json.data;
                console.log(edit_data)
                $("#station_name").val(edit_data[0].station_name)
                $("#station_ipAddress").val(edit_data[0].station_ipAddress)
                $("#selectBox01").val(edit_data[0].project_id).prop("selected", true )

                project_select(edit_data[0].project_id)
                $("#selectBox02").val(edit_data[0].location_id).prop("selected", true )
                location_id_1 = edit_data[0].location_id
                station_seq = edit_data[0].station_seq
               
                $("#station_id").val(edit_data[0].station_id)
                $("#station_udp1").val(edit_data[0].station_udp1)
                
                $("#station_udp2").val(edit_data[0].station_udp2)
                $("#station_udp3").val(edit_data[0].station_udp3)
            },
            error: function(json){
                alert("로케이션 edit error")
            }
        });
    }

    

    

    // add 버튼 클릭시 데이터 추가 
    $("#btn_add").click(function(){

        
        var form_data = new FormData($('#formSetTop')[0]);
 
        form_data.append("location_id" , $("#selectBox02 option:selected").val())
        

        var station_name = $("#station_name").val()
        var station_ipAddress = $("#station_ipAddress").val()
        var station_id = $("#station_id").val()
        var station_udp1 = $("#station_udp1").val()
        var station_udp2 = $("#station_udp2").val()
        var station_udp3 = $("#station_udp3").val()
        var select01 = $("#selectBox01 option:selected").val();
        var select02 = $("#selectBox02 option:selected").val();

       
        console.log(station_name.length)
      
        if(station_name == ""){
            alert("station_name 입력해주세요.");
            $("#station_name").focus();
            return;
        }else if(select01 == 'all'){
            alert("project 선택해주세요.");
            $("#select01").focus();
            return;
        }else if(select02 == 'all'){
            alert("location 선택해주세요.");
            $("#select02").focus();
            return;
        }else if(station_id == ""){
            alert("station_id 입력해주세요.");
            $("#station_id").focus();
            return;
        }else if(station_name.length > 25){
            alert("STATION NAME 25자 이하로 입력해주세요.");
            $("#station_name").focus();
            return;
        }else if(station_id.length > 25){
            alert("STATION ID 25자 이하로 입력해주세요.");
            $("#station_id").focus();
            return;
        }else if(station_udp1 == ""){
            alert("UDP PORT1을 입력해주세요.");
            $("#station_udp1").focus();
            return;
        }else if(station_udp2 == ""){
            alert("UDP PORT2을 입력해주세요.");
            $("#station_udp2").focus();
            return;
        }else if(station_udp3 == ""){
            alert("UDP PORT3을 입력해주세요.");
            $("#station_udp3").focus();
            return;
        }

        // 결함리포트 ( 4 - 2)
        if(parseInt(station_udp1) < 1 || parseInt(station_udp1) > 65535){
            alert("UDP PORT1은 1 ~ 65535 사이 값입니다.")
            return;
        }

        if(parseInt(station_udp2) < 1 || parseInt(station_udp2) > 65535){
            alert("UDP PORT2은 1 ~ 65535 사이 값입니다.")
            return;
        }

        if(parseInt(station_udp3) < 1 || parseInt(station_udp3) > 65535){
            alert("UDP PORT3은 1 ~ 65535 사이 값입니다.")
            return;
        }

        if(station_udp1 == station_udp2 || station_udp1 == station_udp3 || station_udp3 == station_udp2){
            alert("포트가 중복되었습니다.");
            return;
        }
        $.ajax({
            url : "/station/add",
            data: form_data,
            type: "POST",
            async : false,
            contentType: false,
            processData: false,
            beforeSend: function() {
    
            },
            success : function(data) {
                if(data.resultCode==100){
                    alert(data.resultString);
                }else{
                    alert(data.resultString);
                    location.href='Station_list'
                }
                
            },
            error: function(){
                console.log("상세 조회시 에러가 발생했습니다.");
                
            }
        });
    })

    // edit 버튼 클릭시 데이터 추가 
    $("#btn_edit").click(function(){
        
        var form_data = new FormData($('#formSetTop')[0]);
        
        form_data.append("location_id" , $("#selectBox02 option:selected").val())
        form_data.append("location_id_1" , location_id_1)
        form_data.append("station_seq" , station_seq)
        console.log(location_id_1)


        var station_name = $("#station_name").val()
        var station_ipAddress = $("#station_ipAddress").val()
        var station_id = $("#station_id").val()
        var station_udp1 = $("#station_udp1").val()
        var station_udp2 = $("#station_udp2").val()
        var station_udp3 = $("#station_udp3").val()
        var select01 = $("#selectBox01 option:selected").val();
        var select02 = $("#selectBox02 option:selected").val();

        
      
        if(station_name == ""){
            alert("station_name 입력해주세요.");
            $("#station_name").focus();
            return;
        }else if(select01 == 'all'){
            alert("project 선택해주세요.");
            $("#select01").focus();
            return;
        }else if(select02 == 'all'){
            alert("location 선택해주세요.");
            $("#select02").focus();
            return;
        }else if(station_id == ""){
            alert("station_id 입력해주세요.");
            $("#station_id").focus();
            return;
        }else if(station_name.length > 25){
            alert("STATION NAME 25자 이하로 입력해주세요.");
            $("#station_name").focus();
            return;
        }else if(station_id.length > 25){
            alert("STATION ID 25자 이하로 입력해주세요.");
            $("#station_id").focus();
            return;
        }else if(station_udp1 == ""){
            alert("UDP PORT1을 입력해주세요.");
            $("#station_udp1").focus();
            return;
        }else if(station_udp2 == ""){
            alert("UDP PORT2을 입력해주세요.");
            $("#station_udp2").focus();
            return;
        }else if(station_udp3 == ""){
            alert("UDP PORT3을 입력해주세요.");
            $("#station_udp3").focus();
            return;
        }

        // 결함리포트 ( 4 - 2)
        if(parseInt(station_udp1) < 1 || parseInt(station_udp1) > 65535){
            alert("UDP PORT1은 1 ~ 65535 사이 값입니다.")
            return;
        }

        if(parseInt(station_udp2) < 1 || parseInt(station_udp2) > 65535){
            alert("UDP PORT2은 1 ~ 65535 사이 값입니다.")
            return;
        }

        if(parseInt(station_udp3) < 1 || parseInt(station_udp3) > 65535){
            alert("UDP PORT3은 1 ~ 65535 사이 값입니다.")
            return;
        }
        
        if(station_udp1 == station_udp2 || station_udp1 == station_udp3 || station_udp3 == station_udp2){
            alert("포트가 중복되었습니다.");
            return;
        }
        console.log(select02)

        $.ajax({
            url : "/station/add",
            data: form_data,
            type: "PUT",
            async : false,
            contentType: false,
            processData: false,
            beforeSend: function() {
    
            },
            success : function(json) {
                if(json.resultCode==100){
                    alert(json.resultString);
                }else{
                    alert(json.resultString);
                    location.href='Station_list'
                }
                // alert(json.resultString);
                // location.href='Station_list'
                
            },
            error: function(){
                console.log("상세 조회시 에러가 발생했습니다.");
    
                
            }
        });
        
    })
    
})




var project_select = function(select_project_id){
    console.log(select_project_id)
    $.ajax({
        type: "GET",
        url: "/locationlist/add?project_id="+select_project_id,
        async : false,
        success : function(json) {
            // console.log(json.data)
            var location_name = json.data
            console.log(location_name)
            for(var i = 0; i < location_name.length; i++){
                $("#selectBox02").append('<option value='+location_name[i].location_id+'>'+location_name[i].location_name+'</option>');
            }

        },
        error: function(json){
            alert("로케이션 조회 오류")
        }
    });

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

