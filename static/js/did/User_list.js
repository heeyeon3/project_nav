var user_name = ''
var user_description = ''
var user_company = ''
var current_user_id = ''
var current_user_gr = ''
var current_user_project_id = ''
var results = "";

var data_status_user;
var not_data_list ="";

$(function(){


    $("#searchText").keyup(function(e) {
        // var regex = /^[a-zA-Z0-9@]+$/;
        var RegExp = /[\{\}\[\]\/?;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;	//정규식 구문
            if (RegExp.test(this.value)) {
            // 특수문자 모두 제거    
            this.value =this.value.replace(RegExp , '');
        }
    });



    editData

    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	 }, 30000);
    
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

    if(current_user_gr == "0104"){
        $('#btn_edit').hide()
        $('#btn_delete').hide()
        $('#btn_add').hide()
    }


    //total result 
    totalresult("")
    $('#totalresult').text(results)

    var dataList = $('#tbl_list').DataTable({
        "lengthChange": false,
        "destroy": true,
        "searching": false,
        "ordering": false,
        "info": false,
        // "autoWidth": true,
        // "processing": true,
        // "serverSide": true,
        "responsive": true,
        "pagingType": "full_numbers",
        ajax : {
            "url": "/user/search",
            "type":"POST",
            "async" :"false",
            "data": {
                "user_gr" : current_user_gr,
                "project_id" : current_user_project_id
            },
        },
        "columns": [
                {
                    data: null,

                    render: function(data, type, full, meta){
                        if(current_user_gr !='0104'){
                          
                            return "<input type='checkbox' value='"+data.user_id+"'>";
                        }else{
                           
                            return "<input type='checkbox' value='"+data.user_id+"' style='display:none;'>";
                        }
                        // return "<input type='checkbox' value='"+data.user_id+"'>";
                    }
                },
                { data: "row_cnt"},
                { data: "user_id"},
                { data: "user_nm"},
                { data: "user_email"},
                { data: "comm_nm"},
                { data: "project_name"}
             

        ],
        "columnDefs": [
            {"className": "text-center", "targets": "_all"}
        ],
        "rowCallback": function( row, data, iDisplayIndex ) {


        },

        
        
        "paging": true,
        "pageLength": 5,
        "language": {
          "zeroRecords": "데이터가 존재하지 않습니다.",
           paginate: {
                previous: "<img src='/static/images/paging_prev.png'>",
                first: "<img src='/static/images/paging_first.png'>",
                next: "<img src='/static/images/paging_next.png'>",
                last: "<img src='/static/images/paging_last.png'>"
           }
            
        
        },
        dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12'p>>",
    });

    dataList.ajax.url("/user/search").load();
    console.log(dataList.page.info().recordsTotal);
    console.log(dataList.rows().count());
    console.log($('#tbl_list tbody tr').length);
    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){
        var params = ""
        var schType = $("#selSearchType").val();
        var schTxt  = $("#searchText").val();
        if(schTxt.length > 30){
            alert("검색어는 30자 이내로 입력해주세요");
            return;
        }

        //상세구분 체크
        if(schType == "type01"){
            if(schTxt != ""){
                params += "?user_id="+schTxt;
            }
        }else if(schType == "type02"){
            if(schTxt != ""){
                params += "?user_nm="+schTxt;
            }
        }else if(schType == "type03"){
            if(schTxt != ""){
                params += "?user_email="+schTxt;
            }
        }else if(schType == "type04"){
            if(schTxt != ""){
                params += "?comm_nm="+schTxt;
            }
        }else if(schType == "type05"){
            if(schTxt != ""){
                params += "?project_name="+schTxt;
            }
        }
        // console.log("Device search = ["+params+"]")
        dataList.ajax.url("/user/search"+params).load();
        totalresult(params)
        $('#totalresult').text(results)
    });  

    // 중복체크 불가
    $('#tbl_list tbody').on('change', 'input[type="checkbox"]', function(){
        if($(this).prop('checked')){
        
            // $('input[type="checkbox"]').prop('checked',false);
        
            $(this).prop('checked',true);
    
        }else{
            $('#user_info').hide()
        }
        
    });

     
     //all check 안되게
    $('#tbl_list thead').on('change', 'input[type="checkbox"]', function(){        
            $('input[type="checkbox"]').prop('checked',false);

    })

  

    /// 삭제 버튼
    $('#btn_delete').click(function(){
        
        var user_id_list = $('input[type="checkbox"]:checked');
        console.log(user_id_list)
        
        var user_list = [];
        if(user_id_list.length > 0){
            for(let i =0; i<user_id_list.length; i++){
                user_list.push(user_id_list[i].defaultValue)
            }
            console.log(user_list)
            if(user_list.indexOf('admin') != -1){
                alert('admin 계정은 삭제할 수 없습니다.')
                return;
            }
            
            
        } else{
            console.log("안됨")
            alert("사용자를 선택해 주세요.")
            return
        }

        let delconfirm = confirm("사용자를 삭제하겠습니까?")
        if(delconfirm){
            console.log("삭제되었습니다.")
            console.log(JSON.stringify(user_list))
            $.ajax({
                url : "/user/add",
                data: {
                    "user_id" : JSON.stringify(user_list),
                    "use_yn" : 'N'
                },
                type: "DELETE",
                async : false,
                beforeSend: function() {
    
                },
                error:function(error){
                    alert(error.resultString);
                },
                success:function(data) {
                    alert("사용자가 삭제되었습니다.");
                    $('#btnSearch').click();
    
                }
            });
        }
    })

    $.ajax({
		type: "POST",
		url: "/user/search",
		async : false,
		data:{
			"user_gr" : current_user_gr,
            "project_id" : current_user_project_id
		},
		success : function(json) {
			edit_data = json.data;
			console.log(edit_data)
		},
		error: function(json){
			alert("조회 오류")
		}
	});


})

function editData(){
    var findcheck_len = $('input[type="checkbox"]:checked')
    
    // var findcheck = $('input[type="checkbox"]:checked').val();
    // if (findcheck){
    //     window.location.href = "User_create?type=edit&user_id="+findcheck;
    // }else{
    //     alert("사용자를 선택해 주세요")
    // }

    if(findcheck_len.length > 1){
        alert("하나만 선택해 주세요.")
    }else if(findcheck_len.length == 1){
        var findcheck = $('input[type="checkbox"]:checked').val();
        window.location.href = "User_create?type=edit&user_id="+findcheck;
    }else if(findcheck_len.length == 0){ 
        alert("사용자를 선택해 주세요")
       
    }
   
    
}

function totalresult(param){
    $.ajax({
		type: "POST",
		url: "/user/search" +param,
		async : false,
		data:{
			"user_gr" : current_user_gr,
            "project_id" : current_user_project_id
		},
		success : function(json) {
			edit_data = json.data;
			console.log(edit_data)
		},
		error: function(json){
			alert("조회 오류")
		}
	});
    results = edit_data.length
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