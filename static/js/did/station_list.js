var station_name = ''
var station_description = ''
var station_company = ''
var location_id = ''
var edit_data = ''
var results = '';
var user_gr = '';
var user_station = [];

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

    
    $('#station_info').hide()
    editData

    check_data_null_user();
    setInterval(function() {
		check_data_null_user();
	}, 30000);

    $('#btnSearch').on("pointerdown",function(){
        $('#btnSearch').attr('style', "opacity:0.7;")
    })

    //자신에게 매핑된 프로젝트만 수정,삭제 할수 있게 하기
    // $.ajax({
    //     url : "/finduser/project",
    //     type: "GET",
    //     async : false,
    //     error:function(error){
    //         console.log(error.resultString)

    //     },
    //     success:function(data) {
    //         find_data = data.data
    //         // user_gr = find_data[0].user_gr
    //         for(var i=0; i<find_data.length; i++){user_station.push(find_data[i].station_id) }
    //         console.log(user_gr, user_station)

    //     }
    // });

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
            "url": "/station/search",
            "type":"POST",
            "async" :"false"
        },
        "columns": [
                {
                    data: null,

                    render: function(data, type, full, meta){
                        return "<input type='checkbox' value='"+data.station_id+"' location_id = "+data.location_id+">";
                    }
                },
                { data: "row_cnt"},
                { data: "station_name"},
                { data: "station_id"},
                { data: "project_name"},
                { data: "location_name"},
                { data: "station_ipAddress"}
               

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

    dataList.ajax.url("/station/search").load();
   

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
                params += "?station_name="+schTxt;
            }
        }else if(schType == "type02"){
            if(schTxt != ""){
                params += "?station_id="+schTxt;
            }
        }else if(schType == "type03"){
            if(schTxt != ""){
                params += "?project_name="+schTxt;
            }
        }else if(schType == "type04"){
            if(schTxt != ""){
                params += "?location_name="+schTxt;
            }
        }else if(schType == "type05"){
            if(schTxt != ""){
                params += "?station_ipAddress="+schTxt;
            }
        }
        // console.log("Device search = ["+params+"]")
        dataList.ajax.url("/station/search"+params).load();
        //total result 
        totalresult(params)
        $('#totalresult').text(results)
    });  

    // 중복체크 불가

    $("#tbl_list").on('click', ' tbody tr', function(e){
        if( $(e.target).is('input:checkbox') ) return;
        // $('input[type="checkbox"]').prop('checked',false);


      
            $('#station_info').show()
            //체크값 info 넣어주기
            var station_id = $(this).closest('tr').find('td:eq(0) input').val();
            var project = $(this).closest('tr').find('td:eq(3)').text();
            
            
            $("#info_project").text($(this).closest('tr').find('td:eq(4)').text());
            $("#info_location").text($(this).closest('tr').find('td:eq(5)').text());
            $("#info_address").text($(this).closest('tr').find('td:eq(6)').text());
           
            $.ajax({
                type: "GET",
                url: "/station/edit/selected?station_id="+station_id,
                async : false,
                success : function(json) {
                    console.log(json.data)
                    edit_data = json.data
                    location_id = edit_data[0].location_id
                    $("#info_name").text(edit_data[0].station_name)
                    $("#info_id").text(edit_data[0].station_id)
                    $("#info_udp1").text(edit_data[0].station_udp1)
                    $("#info_udp2").text(edit_data[0].station_udp2)
                    $("#info_udp3").text(edit_data[0].station_udp3)
                    $("#info_des").text(edit_data[0].station_description)
                },
                error: function(json){
                    alert("station info error")
                }
            });
        
        
    });


    $('#tbl_list tbody').on('change', 'input[type="checkbox"]', function(){
        if($(this).prop('checked')){
        
            // $('input[type="checkbox"]').prop('checked',false);
        
            $(this).prop('checked',true);
    
        }
        // else{
        //     $('#station_info').hide()
        // }
        
        // if ($(this).is(':checked')) {
        //     $('#station_info').show()
        //     //체크값 info 넣어주기
        //     var station_id = $(this).closest('tr').find('td:eq(0) input').val();
        //     var project = $(this).closest('tr').find('td:eq(3)').text();
            
            
        //     $("#info_project").text($(this).closest('tr').find('td:eq(5)').text());
        //     $("#info_location").text($(this).closest('tr').find('td:eq(6)').text());
        //     $("#info_address").text($(this).closest('tr').find('td:eq(6)').text());
           
        //     $.ajax({
        //         type: "GET",
        //         url: "/station/edit/selected?station_id="+station_id,
        //         async : false,
        //         success : function(json) {
        //             console.log(json.data)
        //             edit_data = json.data
        //             location_id = edit_data[0].location_id
        //             $("#info_name").text(edit_data[0].station_name)
        //             $("#info_id").text(edit_data[0].station_id)
        //             $("#info_udp1").text(edit_data[0].station_udp1)
        //             $("#info_udp2").text(edit_data[0].station_udp2)
        //             $("#info_udp3").text(edit_data[0].station_udp3)
        //             $("#info_des").text(edit_data[0].station_description)
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


    /// 삭제 버튼
    $('#btn_delete').click(function(){
        var station_list = $('input[type="checkbox"]:checked')
        console.log(station_list)
        var issuccess = true;
        var resultString = "";
        if(station_list.length>0){
            let delconfirm = confirm("스테이션을 삭제하겠습니까?")
            if(delconfirm){
                for(let i =0; i<station_list.length; i++){
                    station_id = station_list[i].defaultValue
                    location_id = station_list[i].attributes.location_id.value
                    console.log(location_id)
                    
                    $.ajax({
                        url : "/station/add",
                        data: {
                            "location_id" : location_id,
                            "station_id" : station_id,
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
                    alert(resultString);
                    $('#station_info').hide();
                } else {
                    alert(resultString);
                }
                $('#btnSearch').click();
            }
        }else{
            console.log("안됨")
            alert("스테이션을 선택해주세요")
        }
        // var station_id = $('input[type="checkbox"]:checked').val();
        
        // if(station_id){
        //     $.ajax({
        //         url : "/station/add",
        //         data: {
        //             "location_id" : location_id,
        //             "station_id" : station_id,
        //             "use_yn" : 'N'
        //         },
        //         type: "PUT",
        //         async : false,
        //         beforeSend: function() {
    
        //         },
        //         error:function(error){
        //             alert(error.resultString);
        //             console.log(error.resultString)
    
        //         },
        //         success:function(data) {
        //             alert(data.resultString);
        //             $('#btnSearch').click();
    
        //         }
        //     });
        // }else{
        //     console.log("안됨")
        // }
        

    })



})

function editData(){

    var findcheck_len = $('input[type="checkbox"]:checked')
    console.log(findcheck_len)
    // if(findcheck_len.length > 1){
    //     alert("하나만 선택해 주세요.")
    // }else{
    //     var findcheck = $('input[type="checkbox"]:checked').val();
    //     if (findcheck){
    //         if(user_station.indexOf(parseInt(findcheck)) != -1  || user_gr=='0102'){
    //             window.location.href = "Station_create?type=edit&station_id="+findcheck;
    //         }else if(user_station.indexOf(parseInt(findcheck)) == -1){
    //             alert("해당 스테이션 수정권한이 없습니다.")
    //         }
    //     }else{
    //         alert("스테이션을 선택해 주세요")
    //     }
    // }

    if(findcheck_len.length > 1){
        alert("하나만 선택해 주세요.")
    }else if(findcheck_len.length == 1){
        var findcheck = $('input[type="checkbox"]:checked').val();
        let basefindcheck = findcheck
        console.log(basefindcheck)
        window.location.href = "Station_create?type=edit&station_id="+basefindcheck;
        
    }else if(findcheck_len.length == 0){
        alert("스테이션을 선택해 주세요")
    }

    
   
    
}

function totalresult(param){
    $.ajax({
		type: "POST",
		url: "/station/search" +param,
		async : false,
		success : function(json) {
			edit_data = json.data;
		
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

