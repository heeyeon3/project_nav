var project_name = '';
var project_description = '';
var project_company = '';
var results = '';
var user_gr = '';
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



    $('#project_info').hide()
    editData

    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	 }, 30000);


     

    // 자신에에 매핑된 프로젝트만 수정,삭제 할수 있게 하기
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
            console.log(find_data);
            user_gr = find_data.user_gr
            user_project = find_data.project_id
            console.log(user_gr, user_project)

        }
    });
    

    
    // if(user_gr != '0101'){
    //     $('#menu_project').hide()
    // }

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
            "url": "/project/search",
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                {
                    data: null,

                    render: function(data, type, full, meta){
                        return "<input type='checkbox' value='"+data.project_id+"'>";
                    }
                },
                { data: "row_cnt"},
                { data: "project_name"},
                { data: null,

                 render: function(data){ 
                    if(data.project_description.length < 60){
                        return data.project_description
                    }else{
                        return data.project_description.substr(0,60)+"..."
                    }
                    
                    }},
                { data: "project_company"}
               

        ],
        // "select": {
        //     'style': 'multi',
        //     // 'selector': 'td:first-child'    //only checkbox can select row
        // },
        "columnDefs": [
            // {
            //     'targets': 0,
            //     'checkboxes': {
            //          'selectRow': true
            //      }
            //  },
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

    dataList.ajax.url("/project/search").load();

    //************************************ 조건 검색 클릭 ***************************
    $("#btnSearch").click(function(){
        var params = ""
        var schType = $("#selSearchType").val();
        var schTxt  = $("#searchText").val();
        if(schTxt.length > 30){
            alert("검색어는 30자 이내로 입력해주세요");
            return;
        }

        // var RegExp = /[\{\}\[\]\/?;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;	//정규식 구문
        // if (RegExp.test(schTxt)) {   
        //     schTxt = ''
        // }


        //상세구분 체크
        if(schType == "type01"){
            if(schTxt != ""){
                params += "?project_name="+schTxt;
            }
        }else if(schType == "type02"){
            if(schTxt != ""){
                params += "?project_description="+schTxt;
            }
        }else if(schType == "type03"){
            if(schTxt != ""){
                params += "?project_company="+schTxt;
            }
        }
        console.log(params)
        // console.log("Device search = ["+params+"]")
        dataList.ajax.url("/project/search"+params).load();
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

        var project_id = $(this).closest('tr').find('td:eq(0) input').val();
            console.log(project_id)
            
            $.ajax({
                type: "GET",
                url: "/project/edit/selected?project_id="+project_id,
                async : false,
                success : function(json) {
                    var edit_data = JSON.parse(json.data);
                    project_description = edit_data.project_description
                    $("#info_des").text(project_description)
                },
                error: function(json){
                    alert("project info error")
                }
            });


            $('#project_info').show()
            var test = $(this).closest('tr').find('td:eq(0) input').val();
            // console.log("test", test)
            project_name = $(this).closest('tr').find('td:eq(2)').text();
            // project_description = $(this).closest('tr').find('td:eq(3)').text();
            project_company = $(this).closest('tr').find('td:eq(4)').text();
            $("#info_name").text(project_name)
            // $("#info_des").text(project_description)
            $("#info_com").text(project_company)

        // if ($(this).find('input[type="checkbox"]').prop('checked')) {
        //     var project_id = $(this).closest('tr').find('td:eq(0) input').val();
        //     console.log(project_id)
            
        //     $.ajax({
        //         type: "GET",
        //         url: "/project/edit/selected?project_id="+project_id,
        //         async : false,
        //         success : function(json) {
        //             var edit_data = JSON.parse(json.data);
        //             project_description = edit_data.project_description
        //             $("#info_des").text(project_description)
        //         },
        //         error: function(json){
        //             alert("중복체크 오류")
        //         }
        //     });


        //     $('#project_info').show()
        //     var test = $(this).closest('tr').find('td:eq(0) input').val();
        //     // console.log("test", test)
        //     project_name = $(this).closest('tr').find('td:eq(2)').text();
        //     // project_description = $(this).closest('tr').find('td:eq(3)').text();
        //     project_company = $(this).closest('tr').find('td:eq(4)').text();
        //     $("#info_name").text(project_name)
        //     // $("#info_des").text(project_description)
        //     $("#info_com").text(project_company)
        // }else($('#project_info').hide())
        
    });

    // $("#tbl_list").on('click', 'tbody tr', function () {
    //     var row = $("#tbl_list").DataTable().row($(this)).data();
    //     console.log(row);

    //     if($(this).find('input[type="checkbox"]').prop('checked')){
    //         console.log("!@")
    //         $('input[type="checkbox"]').prop('checked',false);
            
    //         $(this).prop('checked',true);
    
    //     }else{
    //         $('input[type="checkbox"]').prop('checked',false);
    //         $(this).find('input[type="checkbox"]').prop('checked',true);
            
    //     }

    //     if ($(this).find('input[type="checkbox"]').prop('checked')) {
    //         $('#project_info').show()
    //         var test = $(this).closest('tr').find('td:eq(0) input').val();
    //         console.log("test", test)
    //         project_name = $(this).closest('tr').find('td:eq(2)').text();
    //         project_description = $(this).closest('tr').find('td:eq(3)').text();
    //         project_company = $(this).closest('tr').find('td:eq(4)').text();
    //         $("#info_name").text(project_name)
    //         $("#info_des").text(project_description)
    //         $("#info_com").text(project_company)
    //     }else($('#project_info').hide())
        
    // });

 
    
    $('#tbl_list tbody').on('click', 'input[type="checkbox"]', function(){
   
        
        if($(this).prop('checked')){
           
            // $('input[type="checkbox"]').prop('checked',false);
        
            $(this).prop('checked',true);
    
        }
        // else{
        //     console.log("2")
        //     $('#project_info').hide()
        // }
        
        // if ($(this).is(':checked')) {
        //     $('#project_info').show()
        //     var test = $(this).closest('tr').find('td:eq(0) input').val();
        //     console.log("test", test)
        //     project_name = $(this).closest('tr').find('td:eq(2)').text();
        //     project_description = $(this).closest('tr').find('td:eq(3)').text();
        //     project_company = $(this).closest('tr').find('td:eq(4)').text();
        //     $("#info_name").text(project_name)
        //     $("#info_des").text(project_description)
        //     $("#info_com").text(project_company)
        // }

        
    });

    
     
     //all check 안되게
    $('#tbl_list thead').on('change', 'input[type="checkbox"]', function(){        
            $('input[type="checkbox"]').prop('checked',false);

    })

    $('#btn_delete').click(function(){
        var project_list = $('input[type="checkbox"]:checked')
        var issuccess = true;
        var resultString = "";

        console.log(project_list)
        if(project_list.length >0){
            let delconfirm = confirm("프로젝트를 삭제하겠습니까?")
            if(delconfirm){
                for(let i =0; i<project_list.length; i++){
                    console.log(project_list[i].defaultValue)
                    project_id = project_list[i].defaultValue
                    $.ajax({
                        url : "/project/add",
                        data: {
                            "project_id" : project_id,
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
                    $('#project_info').hide();
                    alert(resultString);
                } else {
                    alert(resultString);
                }
                $('#btnSearch').click();
            }
            
        }else{
            alert("프로젝트를 선택해 주세요.")
            console.log("안됨")
        }

        
        

    })


})

function editData(){
    
    var findcheck_len = $('input[type="checkbox"]:checked')
    if(findcheck_len.length > 1){
        alert("하나만 선택해 주세요.")
    }else{
        var findcheck = $('input[type="checkbox"]:checked').val()
        if(findcheck){
            if(findcheck == user_project || user_gr == '0102' || user_gr == '0101'){
                window.location.href = "Project_create?type=edit&project_id="+findcheck;
            }else if(findcheck != user_project){
                alert("해당 프로젝트 수정권한이 없습니다.")
            }
        }else{
            alert("프로젝트를 선택해 주세요")
        }
    }
    
    
    
}


function totalresult(param){
    $.ajax({
		type: "POST",
		url: "/project/search" +param,
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
