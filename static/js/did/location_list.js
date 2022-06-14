var location_name = ''
var location_description = ''
var location_company = ''
var results = '';
var user_gr = '';
var user_location = [];
var user_project = '';

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


    
    $('#location_info').hide()

    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	 }, 30000);


    // 자신에게 매핑된 프로젝트만 수정,삭제 할수 있게 하기
    $.ajax({
        url : "/finduser/project?status=1000",
        type: "GET",
        async : false,
        error:function(error){
            console.log(error.resultString)

        },
        success:function(data) {
            console.log(data)
            find_data = data.data
            console.log(find_data)
            user_gr = find_data[0].user_gr
          
            for(var i=0; i<find_data.length; i++){user_location.push(find_data[i].location_id) }
            // user_location = find_data.location_id
            user_project = find_data[0].project_id
   

        }
    })

    $.ajax({
        url : "/user/currentfind?status=1000",
        // data: {
        //     "project_id" : project_id,
        //     "use_yn" : 'N'
        // },
        type: "GET",
        async : false,
        error:function(error){
            console.log(error.resultString)

        },
        success:function(json) {
            find_data = JSON.parse(json.data)
        
            user_gr = find_data.user_gr
            // user_project = find_data[0].project_id
            user_project = find_data.project_id
       

        }
    });
    if(user_gr=='0104'){
        $('#btn_delete').hide()
        $('#btn_add').hide()
        $('#btn_edit').hide()
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
            "url": "/location/search",
            "type":"POST",
            "async" :"false",
            "data": {
                "user_gr" : user_gr,
                "project_id" : user_project
            },
        },
        "columns": [
                {
                    data: null,

                    render: function(data, type, full, meta){
                        return "<input type='checkbox' value='"+data.location_id+"'>";
                    }
                },
                { data: "row_cnt"},
                { data: "location_name"},
                // { data: null,

                //     render: function(data){ 
                //        if(data.location_description.length < 60){
                //            return data.location_description
                //        }else{
                //            return data.location_description.substr(0,60)+"..."
                //        }
                       
                //        }},
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

    dataList.ajax.url("/location/search").load();
  

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
                params += "?location_name="+schTxt;
            }
        }else if(schType == "type02"){
            if(schTxt != ""){
                params += "?project_name="+schTxt;
            }
        }
      
        dataList.ajax.url("/location/search"+params).load();
        //total result 
        totalresult(params)
        $('#totalresult').text(results)
    });  

    // 중복체크 불가
    $("#tbl_list").on('click', ' tbody tr', function(e){
        if( $(e.target).is('input:checkbox') ) return;
        // $('input[type="checkbox"]').prop('checked',false);
        // var chkbox = $(this).find('td:first-child :checkbox');
        // chkbox.prop('checked', !chkbox.prop('checked'));

        
        $('#location_info').show()
        //체크값 info 넣어주기
        var location_id = $(this).closest('tr').find('td:eq(0) input').val();
     
        
        var project = $(this).closest('tr').find('td:eq(3)').text();
        
        $("#info_pr").text(project)
    
        $.ajax({
            type: "GET",
            url: "/location/edit/selected?location_id="+location_id,
            async : false,
            success : function(json) {
                var edit_data = JSON.parse(json.data);
                console.log(edit_data)
                $("#info_name").text(edit_data.location_name)
                $("#info_des").text(edit_data.location_description)
            },
            error: function(json){
                alert("location info error")
            }
        });
      
    });


    $('#tbl_list tbody').on('change', 'input[type="checkbox"]', function(){
        if($(this).prop('checked')){
        
            // $('input[type="checkbox"]').prop('checked',false);
        
            $(this).prop('checked',true);
    
        }
        // else{
        //     $('#location_info').hide()
        // }
        
        // if ($(this).is(':checked')) {
        //     $('#location_info').show()
        //     //체크값 info 넣어주기
        //     var location_id = $(this).closest('tr').find('td:eq(0) input').val();
        //     console.log(location_id)
            
        //     var project = $(this).closest('tr').find('td:eq(3)').text();
            
        //     $("#info_pr").text(project)
      
        //     $.ajax({
        //         type: "GET",
        //         url: "/location/edit/selected?location_id="+location_id,
        //         async : false,
        //         success : function(json) {
        //             var edit_data = JSON.parse(json.data);
        //             $("#info_name").text(edit_data.location_name)
        //             $("#info_des").text(edit_data.location_description)
        //         },
        //         error: function(json){
        //             alert("중복체크 오류")
        //         }
        //     });
        // }

        
    });
     
     //all check 안되게
    $('#tbl_list thead').on('change', 'input[type="checkbox"]', function(){        
            $('input[type="checkbox"]').prop('checked',false);

    })

    $()

    /// 삭제 버튼
    $('#btn_delete').click(function(){
        var location_list = $('input[type="checkbox"]:checked')
        var issuccess = true;
        var resultString = "";
        if(location_list.length >0){
            let delconfirm = confirm("로케이션을 삭제하겠습니까?")
            if(delconfirm){
                for(let i =0; i<location_list.length; i++){
                    location_id = location_list[i].defaultValue
                    $.ajax({
                        url : "/location/add",
                        data: {
                            "location_id" : location_id,
                            "use_yn" : 'N'
                        },
                        type: "PUT",
                        async : false,
                        beforeSend: function() {
            
                        },
                        error:function(error){
                            resultString = error.resultString;
                            issuccess = false;
                            
            
                        },
                        success:function(data) {
                            resultString = data.resultString
            
                        }
                    });
                }
                if(issuccess){
                    $('#location_info').hide();
                    alert(resultString);
                } else {
                    alert(resultString);
                }
                $('#btnSearch').click();
            }
        }else{
            console.log("안됨")
            alert("로케이션을 선택해 주세요.")
        }
    //     var location_id = $('input[type="checkbox"]:checked').val();
    //     if(location_id){
            
    //             $.ajax({
    //                 url : "/location/add",
    //                 data: {
    //                     "location_id" : location_id,
    //                     "use_yn" : 'N'
    //                 },
    //                 type: "PUT",
    //                 async : false,
    //                 beforeSend: function() {
        
    //                 },
    //                 error:function(error){
    //                     alert(error.resultString);
                        
        
    //                 },
    //                 success:function(data) {
    //                     alert(data.resultString);
    //                     $('#btnSearch').click();
        
    //                 }
    //             });
            
            
    // }else{
    //     console.log("안됨")
    // }
        

    })


})

function editData(){
    

    var findcheck_len = $('input[type="checkbox"]:checked')
    // if(findcheck_len.length > 1){
    //     alert("하나만 선택해 주세요.")
    // }else{
    //     var findcheck = $('input[type="checkbox"]:checked').val();
    //     console.log(findcheck)
    //     console.log(user_location)
    //     if (findcheck){
    //         if(user_location.indexOf(parseInt(findcheck)) != -1  || user_gr=='0102'){
    //             window.location.href = "Location_create?type=edit&location_id="+findcheck;
    //         }else if(user_location.indexOf(parseInt(findcheck)) == -1){
    //             alert("해당 로케이션 수정권한이 없습니다.")
    //         }
            
    //     }else{
    //         alert("로케이션을 선택해 주세요")
    //     }
    // }

    if(findcheck_len.length > 1){
        alert("하나만 선택해 주세요.")
    }else if(findcheck_len.length == 1){
        var findcheck = $('input[type="checkbox"]:checked').val();
        window.location.href = "Location_create?type=edit&location_id="+findcheck;
    }else if(findcheck_len.length == 0){ 
        alert("로케이션을 선택해 주세요")
       
    }

    
   
    
}

function totalresult(param){
    $.ajax({
		type: "POST",
		url: "/location/search" +param,
		async : false,
		success : function(json) {
			edit_data = json.data;
			console.log(edit_data)
		},
		error: function(json){
			alert("조회 오류")
		}
	});
    results = edit_data.length
    console.log(results)
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
