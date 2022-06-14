
var treenode_id = "";
var gnsstype = "";
var satellite_select = "";
var satellite_list = [];
var radiocheck = "";
var station_id = "";
var edit_data = [];

var termstart = "";
var termsend = "";
var plotType = "";

var datasets_L1 = [];
var datasets_L2 = [];
var datasets_A = [];
var datasets_E = [];
var data_E = [];
var data_N = [];
var data_U = [];
var cconfig_L1 = "";
var config_L2 = "";
var config_A = "";
var config_E = "";

var myChart01 = "";
var myChart02 = "";
var myChart03 = "";
var myChart04 = "";
var myChart001 = "";
var myChart002 = "";
var myChart003 = "";

var find_station_edit_data = [];

var data_status;

var data_status_user;
var not_data_list ="";
let tooltip_data_list = [];
let tooltip_data_date_list = [];

let datasave = [];
let datasave_date = [];

var z_project_name= "";
var z_location_name= "";

let treenode_tid ="";

let daydiff = 0;
let startday = "";
let endday = "";

$(function(){
    $("#ratedate").keyup(function(e) {
        this.value = this.value.replace(/[^0-9.]/g, '');
    });

    // $("#spinner_wrap").hide();
    $("#btn_search").on('click', function(){
        $("#spinner_wrap").show();

        setTimeout(() => {
            selectgraph();
        }, 500);
    })


    check_data_null_user("first");
    setInterval(function() {
		check_data_null_user();
	 }, 30000);
    // 스크롤바 디자인
	if($('.scrollbar-dynamic').length){
		$('.scrollbar-dynamic').scrollbar();
	}

    $('#linechart').hide()
    $('#savebtn').hide()

    
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;

    // URLSearchParams.get()
    station_id =    urlParams.get('station_id');
    treenode_tid =    urlParams.get('treenode_tid');
    // selectday =    urlParams.get('selectday');
    startday = $('#termStart').datepicker('getDate');
    endday  = $('#termEnd').datepicker('getDate');
    daydiff   = (endday - startday)/1000/60/60/24;
    $('#ratedate').val(1)
    // station_id =    'Node02';
    // $('#project_name').text(station_id);

    

     // ztree 
    $.ajax({
        type: "POST",
        url: "/station/search",
        async : false,
        success : function(json) {
            edit_data = json.data;
            find_station_edit_data = edit_data
            for(var i =0; i < edit_data.length; i++){
                if(edit_data[i].station_id == station_id){
                    $('#project_name').text(edit_data[i].station_name)
                    $('#project_nav').text(' > '+ edit_data[i].project_name)
                    $('#location_nav').text(' > '+ edit_data[i].location_name)
                    $('#station_nav').text(' > '+ edit_data[i].station_name)

                    datasave_date = 's'+edit_data[i].station_seq

                    z_project_name = edit_data[i].project_name
                    z_location_name = edit_data[i].location_name
                }
            }
            datasave = 's'+edit_data[0].station_seq
            
            
           
        },
        error: function(json){
            alert("ztree data loading error")
        }
    });
    

	var zNodes =[];

	var project = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (project.indexOf(edit_data[i].project_name) == "-1"){
			project.push(edit_data[i].project_name)
			if(edit_data[i].project_name == z_project_name){
                zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name, open:true });
            }else{
                zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name });
            }
		}
	}

	var location = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (location.indexOf(edit_data[i].location_name) == "-1"){
			location.push(edit_data[i].location_name)
			if(edit_data[i].location_name == z_location_name){
                zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name, open:true});
            }else{
                zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name});
            }
		}
	}

	var station = [];
	for(var i = 0; i < edit_data.length ; i++){
		
		if (station.indexOf(edit_data[i].station_id) == "-1"){
			station.push(edit_data[i].station_name)
			zNodes.push({ id: "s"+edit_data[i].station_seq, pId: "l"+edit_data[i].location_id, name: edit_data[i].station_name})
		}
	}
	
    var setting = {
		data: {
			simpleData: {
				enable: true
			}
		},
        callback : {
            beforeClick: getnodeid,
            onExpand : OnExpand
        },
        view: {
            addDiyDom: addDiyDom,
            addHoverDom: addHoverDom,
			removeHoverDom: removeHoverDom,
        }
	};
	
	let a = $(document).ready(function(){
		$.fn.zTree.init($("#treeDemo"), setting, zNodes);
        mapping_data_img();
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var node = treeObj.getNodeByTId(treenode_tid);
        console.log("CHECK",node);
        treeObj.selectNode(node);

         // MOUSE EVENT
         $("#tooltip—01").removeClass('showtooltip');
         $("#tooltip—01").addClass('hidetooltip');

	});
    
    

    tooltip_data_date()

    function addHoverDom(treeId, treeNode) {
        console.log("IN HOVER");
		// console.log(treeNode.id)
		datasave = treeNode.id
        //********************* TOOLTIP  **********
        if(treeNode.level == 2 && treeNode.id.indexOf("s")>-1){
            var tooltip = '[class^="tooltip"]'; 
          
            $(tooltip).click(function(e){ 
                return false; 
            }); 
            
			tooltip_data()
        
                
            var data_length = tooltip_data_list.length
            $('#tooltip_table').empty()
            if(tooltip_data_list.length > 0 && tooltip_data_list.length < 11 ){
                for(var i = 0 ; i < tooltip_data_list.length; i++){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td></tr>")
                }
            }else if(tooltip_data_list.length > 10 && tooltip_data_list.length < 21 ){
                for(var i = 0 ; i < tooltip_data_list.length; i++){
                    if(i < 10 && i+10 < tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><td>"+tooltip_data_list[i+10].satellite_date+"</td></tr>")
                    }else if(i < 10 && i+10 >= tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><tr>")
                    }
                    
                }
            }else if(tooltip_data_list.length > 20 && tooltip_data_list.length < 31 ){
                for(var i = 0 ; i < tooltip_data_list.length; i++){
                    if(i < 10 && i+20 < tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><td>"+tooltip_data_list[i+10].satellite_date+"</td><td>"+tooltip_data_list[i+20].satellite_date+"</td></tr>")
                    }else if(i < 10 && i+20 >= tooltip_data_list.length){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><td>"+tooltip_data_list[i+10].satellite_date+"</td><tr>")
                    }
                    
                }
            }

		
            // TOOLTIP 위치 셋팅
            var $this = $('[class="tree_wrap"]'), 
            $href = "#tooltip—01",
            $top = 320,
            $left = 240 ; 
            
            var config = { 
                tooltipstyle : { 
                    position : 'absolute', 
                    top : $top, 
                    left : $left, 
                    zIndex: 9999 
                }
            }; 
            $($href).css(config.tooltipstyle); 
            // tooltip_data(treeNode.id, "ztree");
            // MOUSE EVENT
            $($href).removeClass('hidetooltip');
            $($href).addClass('showtooltip');
        } else {
            return;
        }
	}


	function removeHoverDom(treeId, treeNode) {
        console.log("OUT HOVER");

        // TOOLTIP 위치 셋팅
        $href = "#tooltip—01",
        
        
        // MOUSE EVENT
        $($href).removeClass('showtooltip');
        $($href).addClass('hidetooltip');
    };

    function addDiyDom(treeId, treeNode){

        if(treeNode.level == 2 && treeNode.id.indexOf("s")>-1){
            console.log("INININ");
            var aObj = $("#" + treeNode.tId + "_ico");       
            var editStr = "";

            var editStr = "<img id='diyBtn_" +treeNode.id+ "' class='ztreeimg' src=''></img>";
            // ul.ztree li li li .button.ico_open { background-image:url("/static/images/tree_2th_on.png"); }
            $("#" + treeNode.tId + "_ico").after(editStr);
        } else {
            return;
        }
        
    }

    function OnExpand(event, treeId, treeNode) {
        console.log("ONEXPAND!!")
        mapping_data_img();        
    };


    function getnodeid(treeId, treeNode, clickFlag) {
        
        // console.log(treeId);
        // console.log(treeNode);
        // console.log(treeNode.getParentNode()); //부모 노드 찾기
        // console.log(treeNode.id); //선택한 아이디

        
        var selecttype = treeNode.id.substr(0,1)
        treenode_id = treeNode.id.substr(1,treeNode.id.length-1) // 앞자리 뻄
        setTimeout(() => {
            if (selecttype == 'p'){
                project_id = treenode_id
                $("#project_nav").text(' > '+treeNode.name)
                $("#location_nav").text(' > '+treeNode.children[0].name)
                $("#station_nav").text(' > '+treeNode.children[0].children[0].name)
                $('#project_name').text(treeNode.children[0].children[0].name)
                station_name = treeNode.children[0].children[0].name
                
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.expandNode(treeNode.children[0], true, false, true);
                mapping_data_img();
                
                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.children[0].children[0].name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }
                $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
                $('#termEnd').datepicker("option", "minDate", new Date())
                var today = new Date()

                year = today.getFullYear(); // 년도
                month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                date = ('0' + today.getDate()).slice(-2); 
                termstart = year+'-'+month+'-'+date
                termend = year+'-'+month+'-'+date
                datasave_date = treeNode.children[0].children[0].id

                treenode_tid = treeNode.children[0].children[0].tId
                console.log(treenode_tid)
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                node = treeObj.getNodeByTId(treenode_tid);
                treeObj.selectNode(node)

                startday = $('#termStart').datepicker('getDate');
                endday  = $('#termEnd').datepicker('getDate');
                daydiff   = (endday - startday)/1000/60/60/24;
                $('#ratedate').val(1)

                selectgraph()
                tooltip_data_date()
            
            }
            else if(selecttype == 'l'){
                $("#project_nav").text(' > '+treeNode.getParentNode().name)
                $("#location_nav").text(' > '+treeNode.name)
                $("#station_nav").text(' > '+treeNode.children[0].name)
                $('#project_name').text(treeNode.children[0].name)
                // page_nav = $("#page_nav").text()
                location_id = treenode_id
                // ro_st_list(location_id)
                
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.expandNode(treeNode, true, false, true);
                mapping_data_img();

                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.children[0].name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }
                datasave_date = treeNode.children[0].id
                $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
                $('#termEnd').datepicker("option", "minDate", new Date())
                var today = new Date()

                year = today.getFullYear(); // 년도
                month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                date = ('0' + today.getDate()).slice(-2); 
            
                termstart = year+'-'+month+'-'+date
                termend = year+'-'+month+'-'+date

                treenode_tid = treeNode.children[0].tId
                var treeObj_1 = $.fn.zTree.getZTreeObj("treeDemo");
                node = treeObj_1.getNodeByTId(treenode_tid);
                treeObj_1.selectNode(treeObj_1.getNodeByTId(treenode_tid))
                startday = $('#termStart').datepicker('getDate');
                endday  = $('#termEnd').datepicker('getDate');
                daydiff   = (endday - startday)/1000/60/60/24;
                $('#ratedate').val(1)

                selectgraph()
                tooltip_data_date()

            }
            else if(selecttype == 's'){
                // $("#station_nav").text(' > '+treeNode.name)
                // station_id = treenode_id
                $("#project_name").text(treeNode.name)

                $("#project_nav").text(' > '+treeNode.getParentNode().getParentNode().name)
                $("#location_nav").text(' > '+treeNode.getParentNode().name)
                $("#station_nav").text(' > '+treeNode.name)
                // $('#project_name').text(treeNode.children[0].name)

                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }
                datasave_date = treeNode.id
                $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
                $('#termEnd').datepicker("option", "minDate", new Date())
                var today = new Date()

                year = today.getFullYear(); // 년도
                month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                date = ('0' + today.getDate()).slice(-2); 
                termstart = year+'-'+month+'-'+date
                termend = year+'-'+month+'-'+date
                
                startday = $('#termStart').datepicker('getDate');
                endday  = $('#termEnd').datepicker('getDate');
                daydiff   = (endday - startday)/1000/60/60/24;
                $('#ratedate').val(1)

                selectgraph()
                tooltip_data_date()

            }
        }, 500);
    }
    // plotType = 'line'
    gnsstype = "'G', 'N', 'B', 'E'"
    // console.log("!@", gnsstype)
	//Gnss Type 중복 선택 막기
	$('#gnsscheck').on('change', 'input[type="checkbox"]', function(){
		// console.log($(this).closest('span').find('input').context.id)
        // if($(this).prop('checked')){
        
        //     $('input[type="checkbox"]').prop('checked',false);
        
        //     $(this).prop('checked',true);
    
        // }
        gnsstype = "";
        gnsstype_list = []
        var findcheck = $('#gnsscheck input[type="checkbox"]:checked').closest('span').find('input')
        
        for(let i = 0; i < findcheck.length; i++){
            gnsstype_list.push(findcheck[i].id)
            if(gnsstype.length == 0){
                gnsstype += "'"+findcheck[i].id+"'"
            }else{
                gnsstype += ", '"+findcheck[i].id+"'"
            }
        }

    });

    //날짜 선택
	$( "#termStart" ).datepicker({
		dateFormat: 'yy.mm.dd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		dayNames: ['일','월','화','수','목','금','토'],
		dayNamesShort: ['일','월','화','수','목','금','토'],
		dayNamesMin: ['일','월','화','수','목','금','토'],
		showMonthAfterYear: true,
		yearSuffix: '년'
	});

	$( "#termEnd" ).datepicker({
		dateFormat: 'yy.mm.dd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
		dayNames: ['일','월','화','수','목','금','토'],
		dayNamesShort: ['일','월','화','수','목','금','토'],
		dayNamesMin: ['일','월','화','수','목','금','토'],
		showMonthAfterYear: true,
		yearSuffix: '년',
		minDate: $('#termStart').datepicker("getDate")
	});

	// $( "#datepicker1" ).datepicker( "getDate" );

	$( "#termStart" ).change(function(){
		var term = $('#termStart').datepicker("getDate")
		
		$('#termEnd').datepicker("option", "minDate", term)
		// $('#termEnd').datepicker("option", "beforeShowDay", noBefore)
		// noBefore(term)
        startday = $('#termStart').datepicker('getDate');
        console.log(endday)

        endday   = $('#termEnd').datepicker('getDate');
        console.log(endday)
        if(endday < startday){
            console.log(startday, endday)
            $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
            endday   = $('#termEnd').datepicker('getDate');
            console.log(startday, endday)

        }
        
        year = term.getFullYear(); // 년도
        month = ('0'+ (term.getMonth() + 1)).slice(-2);  // 월
        date = ('0' + term.getDate()).slice(-2); 
        termstart = year+'-'+month+'-'+date

		startday = $('#termStart').datepicker('getDate');
        endday = $('#termEnd').datepicker("getDate")
        daydiff   = (endday - startday)/1000/60/60/24; 
        console.log(startday, endday)

        if(daydiff > 0){
            $('#ratedate').val((daydiff+1))
            // $("#ratedate").attr("readonly",true);
        }else{
            $('#ratedate').val((daydiff+1))
            // $("#ratedate").attr("readonly",false);
        }
        
	})

    $( "#termEnd" ).change(function(){
        
        var term = $('#termEnd').datepicker("getDate")

        year = term.getFullYear(); // 년도
        month = ('0'+ (term.getMonth() + 1)).slice(-2);  // 월
        date = ('0' + term.getDate()).slice(-2);

        termend = year+'-'+month+'-'+date
        
        startday = $('#termStart').datepicker('getDate');
        endday = $('#termEnd').datepicker("getDate")
        daydiff   = (endday - startday)/1000/60/60/24; 
        if(daydiff > 0){
            $('#ratedate').val((daydiff+1))
            // $("#ratedate").attr("readonly",true);
        }else{
            $('#ratedate').val((daydiff+1))
            // $("#ratedate").attr("readonly",false);
        }
	})
    

    // var x = new Date(parseInt(selectday.substr(0,4)), parseInt(selectday.substr(5,7))-1, parseInt(selectday.substr(8,10)), 0, 0, 0, 0);
    // $( "#termStart, #termEnd").datepicker( "setDate", x );
    $( "#termStart, #termEnd").datepicker( "setDate", new Date() );
    $('#termEnd').datepicker("option", "minDate", new Date())
 
    $( "#termStart, #termEnd" ).attr('readonly',true);
    // 처음화면 오늘 데이터
    $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
    $('#termEnd').datepicker("option", "minDate", new Date())
    var today = new Date();   
    var year = today.getFullYear(); // 년도
    var month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
    var date = ('0' + today.getDate()).slice(-2);  // 날짜 (“0” + this.getDate()).slice(-2);

    var selectday = year+'-'+month+'-'+date

    termstart = selectday
    termend = selectday

    $('#plotType').on('change', 'input[type="radio"]', function(){
		// console.log($(this).closest('span').find('label').text())
        plotType = $(this).closest('span').find('label').text()
    });

    
    $('#satellite').on('change', 'input[type="checkbox"]', function(){
        satellite_select = "";
        satellite_list = []
        // console.log($('#satellite input[type="checkbox"]:checked').closest('span').find('label').text())
        var findcheck = $('#satellite input[type="checkbox"]:checked').closest('span').find('label').text()
       
        // console.log(findcheck.length /5)
        for(var i = 0; i < findcheck.length/5; i++){
            var findcheck2 = findcheck.substr(i*5, 5)

            if(satellite_select == ""){
                satellite_select += "'"+findcheck2.substr(3,5)+"'"
            }else{satellite_select += ", '"+findcheck2.substr(3,5)+"'"}
            // satellite_select += findcheck2.substr(3,5)
            satellite_list.push(findcheck2.substr(3,5))
            
        }     
        // console.log(satellite_select)   
    })
    var findcheck = $('#satellite input[type="checkbox"]:checked').closest('span').find('label').text()
    console.log("findcheck", findcheck)
    for(var i = 0; i < findcheck.length/5; i++){
        var findcheck2 = findcheck.substr(i*5, 5)
        if(satellite_select == ""){
            satellite_select += "'"+findcheck2.substr(3,5)+"'"
        }else{satellite_select += ", '"+findcheck2.substr(3,5)+"'"}
        // satellite_select += findcheck2.substr(3,5)
        satellite_list.push(findcheck2.substr(3,5))
      
        
    }  
    
    termstart = selectday
    termend = selectday
    satellite_select ="'01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37'"
    selectgraph()



    // 체크값에 따라 저장
    radiocheck = "PNG"
    $('#savetype').on('change', 'input[type="radio"]', function(){
        radiocheck = $(this).closest('span').find('label').text()
    });

    $('#savebtn01').click(function(){
        // console.log(radiocheck.length)
        if(radiocheck == 'PNG'){
            downImg()
        }
        else if(radiocheck == 'JPG'){
            downImg_jpg()
        }
        else if(radiocheck == 'PDF'){

            pdf_save()
        }
    })

    //********************* TOOLTIP  **********
	var tooltip = '[class^="tooltip"]'; 
	
	$(tooltip).click(function(e){ 
		return false; 
	}); 
	
	$('.input_data').on('mouseenter mouseleave', function(e) { 
  

		$('#tooltip_table').empty()
        if(tooltip_data_date_list.length > 0 && tooltip_data_date_list.length < 11 ){
            for(var i = 0 ; i < tooltip_data_date_list.length; i++){
                $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].satellite_date+"</td></tr>")
            }
        }else if(tooltip_data_date_list.length > 10 && tooltip_data_date_list.length < 21 ){
            for(var i = 0 ; i < tooltip_data_date_list.length; i++){
                if(i < 10 && i+10 < tooltip_data_date_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].satellite_date+"</td><td>"+tooltip_data_date_list[i+10].satellite_date+"</td></tr>")
                }else if(i < 10 && i+10 >= tooltip_data_date_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].satellite_date+"</td><tr>")
                }
                
            }
        }else if(tooltip_data_date_list.length > 20 && tooltip_data_date_list.length < 31 ){
            for(var i = 0 ; i < tooltip_data_date_list.length; i++){
                if(i < 10 && i+20 < tooltip_data_date_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].satellite_date+"</td><td>"+tooltip_data_date_list[i+10].satellite_date+"</td><td>"+tooltip_data_date_list[i+20].satellite_date+"</td></tr>")
                }else if(i < 10 && i+20 >= tooltip_data_date_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].satellite_date+"</td><td>"+tooltip_data_date_list[i+10].satellite_date+"</td><tr>")
                }
                
            }
        }
			
		// TOOLTIP 위치 셋팅
        if (matchMedia("screen and (min-width: 320px) and (max-width:768px) and ( orientation: portrait )").matches) { 
            var $this = $(this)
            if($this.attr("id")== "termStart"){
                console.log("LEFT PICKER");
                $('.ui-datepicker ').css({ "margin-left" : "350px", "margin-top": "-35px"});
               
            } else if($this.attr("id")== "termEnd"){   
                console.log("RIGHT PICKER");
                $('.ui-datepicker ').css({ "margin-left" : "503px", "margin-top": "-230px"});
                
            }
        } else { 

  
            var $this = $(this), 
            $href = "#tooltip—01",
            $top = $this.offset().top, 
            $left = $this.offset().left+ 200; 

      
         }

		// TOOLTIP 위치 셋팅
		// var $this = $(this), 
		// $href = "#tooltip—01",
		// $top = $this.offset().top, 
		// $left = $this.offset().left + 200 ; 
		
		var config = { 
			tooltipstyle : { 
				position : 'absolute', 
				top : $top, 
				left : $left, 
				zIndex: 9999 
			}
		}; 
		$($href).css(config.tooltipstyle); 
		
		// MOUSE EVENT
        $($href).removeClass('hidetooltip');
        $($href).addClass('showtooltip');
		
		return false; 
	})

    tooltip_data_date()


    // 명시적으로 TOOLTIP 없애버리기
    $("body").on("mouseover", function(target){
        var check_class = $(target.target).attr('class');
        var check_parent_class = $(target.target).parent().attr('class');
        if(check_class == 'node_name' && check_parent_class.indexOf("level2") != (-1)){
            console.log("STATION_NODE!!");  
        } else {
            $("#tooltip—01").removeClass('showtooltip');
            $("#tooltip—01").addClass('hidetooltip');
        }
    });
    
});


function tooltip_data(){ 
  
		$.ajax({
			type: "GET",
			url: "/date/tooltip/satellite?datasave="+datasave,
			// async : false,
			success : function(json) {
				tooltip_data_list = json.data;
				// $('#project_name').text(edit_data[0].project_name)
				console.log(tooltip_data_list)

                var data_length = tooltip_data_list.length
                $('#tooltip_table').empty()
                if(tooltip_data_list.length > 0 && tooltip_data_list.length < 11 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td></tr>")
                    }
                }else if(tooltip_data_list.length > 10 && tooltip_data_list.length < 21 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+10 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><td>"+tooltip_data_list[i+10].satellite_date+"</td></tr>")
                        }else if(i < 10 && i+10 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><tr>")
                        }
                        
                    }
                }else if(tooltip_data_list.length > 20 && tooltip_data_list.length < 31 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+20 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><td>"+tooltip_data_list[i+10].satellite_date+"</td><td>"+tooltip_data_list[i+20].satellite_date+"</td></tr>")
                        }else if(i < 10 && i+20 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].satellite_date+"</td><td>"+tooltip_data_list[i+10].satellite_date+"</td><tr>")
                        }
                        
                    }
                }
              
			},
			error: function(json){
				alert("tooltip_data error")
			}
		});
		
}



//이미지(png)로 다운로드
function downImg(){
    window.scrollTo(0,0)
    html2canvas($('#linechart')[0]).then(function(canvas){
        var todate = new Date();
        
        // console.log(todate.yyyymmddhhmmss())
        var myImage = canvas.toDataURL('image/png');
        downloadURI(myImage, todate+ ".png") 
    });
    // imagediv.style._transform
}

function downImg_jpg(){
    window.scrollTo(0,0)
    html2canvas($('#linechart')[0]).then(function(canvas){
        var todate = new Date();
        
        // console.log(todate.yyyymmddhhmmss())
        var myImage = canvas.toDataURL('image/png');
        downloadURI(myImage, todate+ ".jpg") 
    });
    // imagediv.style._transform
}

function downloadURI(uri, name){
    var link = document.createElement("a")
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
}
function pdf_save() { // pdf저장 button id
    window.scrollTo(0,0)
    html2canvas($('#linechart')[0]).then(function(canvas) { //저장 영역 div id
    
    // 캔버스를 이미지로 변환
    var imgData = canvas.toDataURL('image/png');
         
    var imgWidth = 190; // 이미지 가로 길이(mm) / A4 기준 210mm
    var pageHeight = imgWidth * 1.414;  // 출력 페이지 세로 길이 계산 A4 기준
    var imgHeight = canvas.height * imgWidth / canvas.width;
    var heightLeft = imgHeight;
    var margin = 10; // 출력 페이지 여백설정
    var doc = new jsPDF('p', 'mm');
    var position = 0;
       
    // 첫 페이지 출력
    doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
         
    // 한 페이지 이상일 경우 루프 돌면서 출력
    while (heightLeft >= 20) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    var todate = new Date();
 
    // 파일 저장
    doc.save( todate+'.pdf');
})};


function tooltip_data_date(){

    $.ajax({
        type: "GET",
        url: "/date/tooltip/satellite?datasave="+datasave_date,
        async : false,
        success : function(json) {
            tooltip_data_date_list = json.data;
       
            // $('#project_name').text(edit_data[0].project_name)
            
        },
        error: function(json){
            alert("mouseover error")
        }
    });
}



function selectgraph(){
    ratedate = $('#ratedate').val()
    if((daydiff+1) >  ratedate){
        alert("선택된 DATE 기간의 UPDATE RATE는 "+(daydiff+1) + "min 이상이여야 합니다.")
        $("#ratedate").focus();
        $("#spinner_wrap").hide();
        return 
    }


    $('#linechart').show()
    $('#savebtn').show()
    // ratedate = $('#updaterate option:selected').text()
    // console.log(ratedate) 
    // console.log(station_id)
    // console.log(termstart)
    // console.log(ratedate)
    // console.log(termend)
    // console.log(gnsstype)
    // console.log(satellite_select)
    // console.log(satellite_list)

    const colors = [
        '#1e87f0', '#5856d6', '#ff9500', '#ffcc00', '#ff3b30', '#5ac8fa', '#007aff', '#4cd964', '#aeff00', '#00ffe1',
        '#00ff62', '#0066ff', '#00ffd5', '#b2ff00', '#ffe100', '#00ff91', '#ff8000', '#1900ff', '#ff1500', '#00ffd0',
        '#73ff00', '#ff8800', '#e6ff00', '#0055ff', '#fffb00', '#2f00ff', '#00ff73', '#006eff', '#ffcc00', '#22ff00',
        '#ff2600', '#00aeff', '#b2ff00', '#8cff00', '#ffbb00', '#d9ff00', '#00aeff', '#ffa600', '#ff4d00', '#ccff00', 
        '#fbff00', '#ffe100', '#c3ff00', '#00ff88', '#00e5ff', '#ff4000', '#00ccff', '#00ddff', '#00ff19', '#0088ff',
    ];

    console.log(colors[10])
    data_satellite_L1 = [];
    data_satellite_L2 = [];
    data_satellite_A = [];
    data_satellite_E = [];
   
    graphlabel = [];
    data_E =[];
    data_N =[];
    data_U =[];

    datasets_L1 = [];
    datasets_L2 = [];
    datasets_A = [];
    datasets_E = [];

    data_L1_point = [];
    data_L2_point = [];
    data_A_point = [];
    data_E_point = [];

    var y = [];
    
    $.ajax({
        type: "POST",
        url: "/monitoring/station/satellite",
        async : false,
		data : {
			station_id : station_id,
            startdate : termstart,
            enddate : termend,
            ratedate : ratedate,
            gnsstype : gnsstype,
            satellitetype : satellite_select,
		},
        success : function(json) {
            edit_data = json.data;
            console.log(edit_data)
           
            
            for(var i = 0; i < edit_data.length; i++){
                if (graphlabel.indexOf(edit_data[i].satellite_date) == "-1"){
                    graphlabel.push(edit_data[i].satellite_date)
                    
            }}
            console.log(graphlabel)
            for(var j = 0; j < satellite_list.length; j++){
                data_satellite_L1 = []
                data_satellite_L2 = []
                data_satellite_A = []
                data_satellite_E = []
                for(var k = 0; k < graphlabel.length; k++){
                            data_satellite_L1.push(null)
                            data_satellite_L2.push(null)
                            data_satellite_A.push(null)
                            data_satellite_E.push(null)
                        }
                
                for(var i = 0; i < edit_data.length; i++){

                    if(edit_data[i].satellite_svno == satellite_list[j]){
                        var idx = graphlabel.indexOf(edit_data[i].satellite_date)
                        data_satellite_L1[idx] = edit_data[i].satellite_L1
                        data_satellite_L2[idx] = edit_data[i].satellite_L2
                        data_satellite_A[idx] = edit_data[i].satellite_elevation
                        data_satellite_E[idx] = edit_data[i].satellite_azimuth
                        // console.log("akwk", edit_data[i].satellite_svno, satellite_list[j] )
                        // data_satellite_L1.push(edit_data[i].satellite_L1) 
                        // data_satellite_L2.push(edit_data[i].satellite_L2) 
                        // data_satellite_A.push(edit_data[i].satellite_elevation) 
                        // data_satellite_E.push(edit_data[i].satellite_azimuth) 

                        y.push(i)
    
                    }
                    // console.log(data_satellite_L1)
                    if(i == edit_data.length-1){
                        var col =  colors[parseInt(satellite_list[j])]
                        data_L1_point = [];
                        data_L2_point = [];
                        data_A_point = [];
                        data_E_point = [];
                        
                        

                        for (let n = 0 ; n < graphlabel.length; n++ ){
                            if(data_satellite_L1[n]){
                                data_L1_point.push({'x':graphlabel[n],'y':data_satellite_L1[n]})
                            }
                            if(data_satellite_L2[n]){
                                data_L2_point.push({'x':graphlabel[n],'y':data_satellite_L2[n]})
                            }
                            if(data_satellite_A[n]){
                                data_A_point.push({'x':graphlabel[n],'y':data_satellite_A[n]})
                            }
                            if(data_satellite_E[n]){
                                data_E_point.push({'x':graphlabel[n],'y':data_satellite_E[n]})
                            }
                        }
                       
                        datasets_L1.push({
                            label: satellite_list[j],
                            backgroundColor: col,
                            borderColor: col,
                            data:  data_L1_point, 
                            borderWidth:1
                        })

                        datasets_L2.push({
                            label: satellite_list[j],
                            backgroundColor: col,
                            borderColor: col,
                            data:  data_L2_point, 
                            borderWidth:1
                        })

                        datasets_A.push({
                            label: satellite_list[j],
                            backgroundColor: col,
                            borderColor: col,
                            data:  data_A_point, 
                            borderWidth:1
                        })

                        datasets_E.push({
                            label: satellite_list[j],
                            backgroundColor: col,
                            borderColor: col,
                            data:  data_E_point, 
                            borderWidth:1
                        })

                            
                        
                        
                    }
                    
                    
                }
            }
            
            
            
        },
        error: function(error){
            console.log(error)
        }
    });
    
    console.log(plotType)
    
    if (plotType == "Point"){

        config_L1 = {
            type: 'line',
            data: {
                labels: graphlabel,
                datasets: datasets_L1
            },
            options: {
                showLine: false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                responsive : false,
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        // max: graphlabel.length-1,
                        // type: 'linear',
                        // position: 'bottom',
                        // boxWidth :10,
                        // ticks:{
                        //     color: "#FFFFFF",
                        //     callback: function(value, index, values) {
                        //         for(let i =0 ;i<graphlabel.length; i++ )
                        //             if(i == value){
                        //                 value = graphlabel[i]
                        //             }
                        //         return  value;}
                        // },
                        ticks: {
                            // autoSkip: false,
                            maxRotation: 0,
                            color: "#FFFFFF",
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/5);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        }
                    },
                    // xAxes: [{ 
                    // //    ticks:{stepSize:10 }
                    //     gridLines: { lineWidth: 10 },
                    //  }]
                   
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',
                            boxWidth : 10,
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"L1 CN0 [dB-Hz]", //수정사항 2022.03.22
                        position: 'left'
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
    
                                var labels = "";
                                labels = context.dataset.label+  "\n" +context.parsed.y
                                return labels;
                            }
                        }
                        
                    },
                    // tooltip: {
                    //     enabled: true,
                    //     callbacks: {
                    //         label: function(context) {
                    //             console.log(context)

                    //             var labels = "";
                    //             labels = graphlabel[context.label] + "\n" +context.parsed.y
                    //             return labels;
                    //         }
                    //     }
                        
                    // },

                },
                elements: {
                    point:{
                        radius: 1
                    }
                }
                
               
                
            }
        };

        config_L2 = {
            type: 'line',
            data: {
                labels: graphlabel,
                datasets: datasets_L2
            },
            options: {
                showLine: false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                responsive : false,
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        boxWidth :10, 
                        ticks: {
                            // autoSkip: false,
                            maxRotation: 0,
                            color: "#FFFFFF",
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
                            console.log(now_tick)
                            var tick_limit = Math.ceil(now_tick.length/5);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        }
                    },
                   
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',
                            boxWidth : 10,
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:" L2 CN0 [dB-Hz]",  //수정사항 2022.03.22
                        position: 'left'
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
    
                                var labels = "";
                                labels = context.dataset.label+  "\n" +context.parsed.y
                                return labels;
                            }
                        }
                        
                    },
                },
                elements: {
                    point:{
                        radius: 1
                    }
                }
                
            }
        };

        config_A = {
            type: 'line',
            data: {
                labels: graphlabel,
                datasets: datasets_A
            },
            options: {
                showLine: false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                responsive : false,
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        boxWidth :10, 
                        ticks: {
                            // autoSkip: false,
                            maxRotation: 0,
                            // Include a dollar sign in the ticks
                            callback: function(val, index) {
                                // Hide every 2nd tick label
                                return index % 6 === 0 ? this.getLabelForValue(val) : '';
                            },
                            color: "#FFFFFF",
                        },
                        grid : {
                            color : "#616161"
                        }
                    },
                   
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',
                            boxWidth : 10,
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"Azimuth [deg]", //수정사항 2022.03.22
                        position: 'left'
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
    
                                var labels = "";
                                labels = context.dataset.label+  "\n" +context.parsed.y
                                return labels;
                            }
                        }
                        
                    },
                    
                },
                elements: {
                    point:{
                        radius: 1
                    }
                }
               
            }
        };

        config_E = {
            type: 'line',
            data: {
                labels: graphlabel,
                datasets: datasets_E
            },
            options: {
                showLine: false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                responsive : false,
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        boxWidth :10, 
                        ticks: {
                            // autoSkip: false,
                            maxRotation: 0,
                            color: "#FFFFFF",
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/5);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        }
                    },
                   
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',boxWidth : 10,
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"Elevation [deg]", //수정사항 2022.03.22
                        position: 'left'
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
    
                                var labels = "";
                                labels = context.dataset.label+  "\n" +context.parsed.y
                                return labels;
                            }
                        }
                        
                    },
                    
                },
                elements: {
                    point:{
                        radius: 1
                    }
                },
                animation:{
                    onComplete : function(){
                        /*Your code here*/
                        $("#spinner_wrap").hide();
                     
                    }
                }
                
                
            }
        };
        
       
        
    }else{
        config_L1 = {
            type: 'line',
            data: {
                labels: graphlabel,
                datasets: datasets_L1
            },
            options: {
                responsive : false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        ticks: {
                        
                            // autoSkip: false,
                            maxRotation: 0,
                            color: "#FFFFFF",
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/5);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        }
                    },
                    
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',
                            boxWidth : 10,
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"L1 CN0 [dB-Hz]", //수정사항 2022.03.22
                        position: 'left'
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
    
                                var labels = "";
                                labels = context.dataset.label+  "\n" +context.parsed.y
                                return labels;
                            }
                        }
                        
                    },
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
                
                
            }
        };
    
        config_L2 = {
            type: 'line',
            data: {
                labels: graphlabel,
                datasets: datasets_L2
            },
            options: {
                responsive : false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        ticks: {
                            // autoSkip: false,
                            maxRotation: 0,
                            color: "#FFFFFF",
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/5);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',
                            boxWidth : 10,
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"L2 CN) [dB-Hz]", //수정사항 2022.03.22
                        position: 'left'
                    }
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
                elements: {
                    point:{
                        radius: 0
                    }
                }
                
            }
        };
    
        config_A = {
            type: 'line',
            data: {
                labels: graphlabel,
                datasets: datasets_A
            },
            options: {
                responsive : false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        ticks: {
                            // autoSkip: false,
                            maxRotation: 0,
                            color: "#FFFFFF",
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/5);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',
                            boxWidth : 10,
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"Azimuth [deg]", //수정사항 2022.03.22
                        position: 'left'
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
    
                                var labels = "";
                                labels = context.dataset.label+  "\n" +context.parsed.y
                                return labels;
                            }
                        }
                        
                    },
                },
                elements: {
                    point:{
                        radius: 0
                    }
                }
                
            }
        };
    
        config_E = {
            type: 'line',
            layout: {
                padding: {
                    right: 10
                }
            },
            data: {
                labels: graphlabel,
                datasets: datasets_E
            },
            options: {
                responsive : false,
                scales: {
                    y: {
                        ticks:{
                            color: "#FFFFFF"
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 40; 
                          }
                    },
                    x: {
                        ticks: {
                            // autoSkip: false,
                            maxRotation: 0,
                            color: "#FFFFFF",
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/5);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        // color:'#FFFFFF'
                        labels:{
                            color: '#FFFFFF',
                            boxWidth : 10,
                            
                        }
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"Elevation [deg]", //수정사항 2022.03.22
                        position: 'left'
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
    
                                var labels = "";
                                labels = context.dataset.label+  "\n" +context.parsed.y
                                return labels;
                            }
                        }
                        
                    },
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
                animation:{
                    onComplete : function(){
                        /*Your code here*/
                        $("#spinner_wrap").hide();
                     
                    }
                }
                
            }
        };
        
    }

    
    
    if(myChart01){myChart01.destroy();}
    if(myChart02){myChart02.destroy();}
    if(myChart03){myChart03.destroy();}
    if(myChart04){myChart04.destroy();}
 
    myChart01 = new Chart(
        document.getElementById('myChart01'),
        config_L1
    );

    myChart02 = new Chart(
        document.getElementById('myChart02'),
        config_L2
    );

    myChart03 = new Chart(
        document.getElementById('myChart03'),
        config_A
    );

    myChart04 = new Chart(
            document.getElementById('myChart04'),
            config_E
        );

}



function check_data_null(){
    $.ajax({
        type: "GET",
        url: "/station/datastatus?status=1000",
        async: false,
        success : function(json) {
            console.log(json);
            data_status = json.data;
            console.log(data_status);
        },
        error: function(json){
            console.log("긴급에러")
            console.log(json)
        }
    });
}

function mapping_data_img(){
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    var nodes = zTree.getNodes();
    function filter(node) {
        return (node.level == 2 && node.id.indexOf("s")>-1);
    }
        
    var st_nodes = zTree.getNodesByFilter(filter); // search the array of the nodes    
    var station_status = [];

    for(j=0; j <data_status_user.length; j++){
        station_status.push(String(data_status_user[j].station_seq));
    }

    for(i=0 ; i < st_nodes.length ; i++){
        
        var regex = /[^0-9]/g;				// 숫자가 아닌 문자열을 선택하는 정규식
        var ztree_station_seq = st_nodes[i].id.replace(regex, "");
        // console.log(st_nodes[i].id);	
        // console.log(ztree_station_seq);	
        // console.log(station_status);	
        if(station_status.indexOf(ztree_station_seq) == (-1)){
            console.log("IN BLUE!!");
            $("#diyBtn_"+st_nodes[i].id).attr('src','/static/images/btn_blue.png')
        } else {
            console.log("IN RED!!");
            $("#diyBtn_"+st_nodes[i].id).attr('src','/static/images/btn_red.png')
        }
    }
}


function check_data_null_user(type){
    var async = true;
    if(type == "first"){
        async = false;
    }
    $.ajax({
        type: "GET",
        url: "/station/datastatus/user?status=1000",
        async: async,
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
            if(async){
                mapping_data_img();
            }
			
        },
        error: function(json){
            console.log("긴급에러")
            console.log(json)
        }
    });

	
}
