var google_map ;
var kakao_map ;
var google_markers = [];
var kakao_markers = [];
var treenode_id = "";
var plotType = "";
var radiocheck = "";
var dataselect = [];
var station_id = "";

var termstart = "";

let daydiff = "";
let startday = "";
let endday = "";

var graphlabel = []
var datasets_E = [];
var datasets_N = [];
var datasets_U = [];
var data_E = [];
var data_N = [];
var data_U = [];
var config_E = "";
var config_N = "";
var config_U = "";

var myChart01 = "";
var myChart02 = "";
var myChart03 = "";
var myChart001 = "";
var myChart002 = "";
var myChart003 = "";

var ratedate = "";
var data_E_point = [];
var data_N_point = [];
var data_U_point = [];

var find_station_edit_data = [];
let tooltip_data_list = [];
let tooltip_data_date_list = [];
let datasave_date = [];

var data_status;  // 10분내로 데이터 들어오고 있는지!
var station_name = "";
var data_status_user;
var not_data_list ="";

var z_project_name= "";
var z_location_name= "";

let treenode_tid ="";
let treeObj;

$(function(){
   
    $("#ratedate").keyup(function(e) {
        this.value = this.value.replace(/[^0-9.]/g, '');
    });


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
  
    // window.onload = function(){$("#spinner_wrap").remove();};
    $("#spinner_wrap").show();
    // URLSearchParams 객체
    var url = new URL(window.location.href);
    const urlParams = url.searchParams;
    
    // URLSearchParams.get()
    station_id =    urlParams.get('station_id');
    selectday =    urlParams.get('selectday');
    treenode_tid =    urlParams.get('treenode_tid');
    // $('#project_name').text(station_id)
    $('#ratedate').val(10)

    // 스크롤바 디자인
	if($('.scrollbar-dynamic').length){
		$('.scrollbar-dynamic').scrollbar();
	}
        
     // ztree 
    $.ajax({
        type: "POST",
        url: "/station/search",
        async : false,
        success : function(json) {
            edit_data = json.data;
            find_station_edit_data = edit_data
            console.log(edit_data);
            // station_id = edit_data[0].station_id
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
            
            station_name = edit_data[0].station_name;
            station_udp1 = edit_data[0].station_udp1;
            station_udp2 = edit_data[0].station_udp2;
            station_udp3 = edit_data[0].station_udp3;

        
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
            // zNodes.push({ id: "p"+edit_data[i].project_id, pId:0, name: edit_data[i].project_name });
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
            // zNodes.push({ id:"l"+edit_data[i].location_id, pId:"p"+edit_data[i].project_id, name:edit_data[i].location_name});
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
        treeObj = $.fn.zTree.getZTreeObj("treeDemo");
     
        var node = treeObj.getNodeByTId(treenode_tid);
        // console.log("CHECK",node);
        treeObj.selectNode(node);

         // MOUSE EVENT
         $("#tooltip—01").removeClass('showtooltip');
         $("#tooltip—01").addClass('hidetooltip');

	});

    dataselect.push('DDC01','DDC02', 'DDC03')
    $('#dataselect').on('change', 'input[type="checkbox"]', function(){
        dataselect = []
        // console.log($('input[type="checkbox"]:checked').closest('span').find('label').text())
        var findcheck = $('input[type="checkbox"]:checked').closest('span').find('label').text()
        console.log(findcheck.length /5)
        for(var i = 0; i < findcheck.length/5; i++){
            dataselect.push(findcheck.substr(i*5, 5))
    
        }        
    })

    function addHoverDom(treeId, treeNode) {
        // console.log("IN HOVER");
		
		datasave = treeNode.id
        //********************* TOOLTIP  **********
        if(treeNode.level == 2 && treeNode.id.indexOf("s")>-1){
            var tooltip = '[class^="tooltip"]'; 
            console.log("!23")
            $(tooltip).click(function(e){ 
                return false; 
            }); 
            
			tooltip_data()
        
                
            console.log("HELLO")
                var data_length = tooltip_data_list.length
                console.log("LENGTH", tooltip_data_list.length)
                $('#tooltip_table').empty()
                if(tooltip_data_list.length > 0 && tooltip_data_list.length < 11 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td></td>")
                    }
                }else if(tooltip_data_list.length > 10 && tooltip_data_list.length < 21 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+10 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td></tr>")
                        }else if(i < 10 && i+10 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><tr>")
                        }
                        
                    }
                }else if(tooltip_data_list.length > 20 && tooltip_data_list.length < 31 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+20 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><td>"+tooltip_data_list[i+20].monitoring_date+"</td></tr>")
                        }else if(i < 10 && i+20 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><tr>")
                        }
                        
                    }
                }
			// if(tooltip_data_list.length > 0){
			// 	// for(var i = 0 ; i < tooltip_data_list.length; i++){
			// 	// 	    $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td></td>")
			// 	// }

                
			// }
            
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
        // console.log("OUT HOVER");

        // TOOLTIP 위치 셋팅
        $href = "#tooltip—01",
        
        
        // MOUSE EVENT
        $($href).removeClass('showtooltip');
        $($href).addClass('hidetooltip');
    };


    function addDiyDom(treeId, treeNode){

        if(treeNode.level == 2 && treeNode.id.indexOf("s")>-1){
            // console.log("INININ");
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
        $("#spinner_wrap").show();
        setTimeout(() => {
            // console.log(treeId);
            // console.log(treeNode);
            // console.log(treeNode.getParentNode()); //부모 노드 찾기
            // console.log(treeNode.id); //선택한 아이디

            
            var selecttype = treeNode.id.substr(0,1)
            treenode_id = treeNode.id.substr(1,treeNode.id.length-1) // 앞자리 뻄
        
            if (selecttype == 'p'){
                project_id = treenode_id
                $("#project_nav").text(' > '+treeNode.name)
                $("#location_nav").text(' > '+treeNode.children[0].name)
                $("#station_nav").text(' > '+treeNode.children[0].children[0].name)
                $("#project_name").text(treeNode.children[0].children[0].name)
                
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.expandNode(treeNode.children[0], true, false, true);
                mapping_data_img();

                station_name = treeNode.children[0].children[0].name
                console.log(station_name)
                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.children[0].children[0].name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }
                var today = new Date()

                year = today.getFullYear(); // 년도
                month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                date = ('0' + today.getDate()).slice(-2); 
                selectday = year+'-'+month+'-'+date

                termstart = year+'-'+month+'-'+date
                termend = year+'-'+month+'-'+date
                
                datasave_date = treeNode.children[0].children[0].id
                $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
                $('#termEnd').datepicker("option", "minDate", new Date())

                startday = $('#termStart').datepicker('getDate');
                endday  = $('#termEnd').datepicker('getDate');
                daydiff   = (endday - startday)/1000/60/60/24;

                treenode_tid = treeNode.children[0].children[0].tId
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                node = treeObj.getNodeByTId(treenode_tid);
                treeObj.selectNode(node)


                $('#ratedate').val(10)
                selectgraph()
                tooltip_data_date()
                
            
            }
            else if(selecttype == 'l'){
                $("#project_nav").text(' > '+treeNode.getParentNode().name)
                $("#location_nav").text(' > '+treeNode.name)
                $("#station_nav").text(' > '+treeNode.children[0].name)
                $("#project_name").text(treeNode.children[0].name)
                // page_nav = $("#page_nav").text()
                location_id = treenode_id
                // ro_st_list(location_id)
                station_name = treeNode.children[0].name

                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.expandNode(treeNode, true, false, true);
                mapping_data_img();

                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.children[0].name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }
                $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
                $('#termEnd').datepicker("option", "minDate", new Date())
                var today = new Date()

                year = today.getFullYear(); // 년도
                month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                date = ('0' + today.getDate()).slice(-2); 
                selectday = year+'-'+month+'-'+date
                termstart = year+'-'+month+'-'+date
                termend = year+'-'+month+'-'+date

                startday = $('#termStart').datepicker('getDate');
                endday  = $('#termEnd').datepicker('getDate');
                daydiff   = (endday - startday)/1000/60/60/24;
                $('#ratedate').val(10)

                treenode_tid = treeNode.children[0].tId
                var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                node = treeObj.getNodeByTId(treenode_tid);
                treeObj.selectNode(node)

                datasave_date = treeNode.children[0].id
                selectgraph()
                tooltip_data_date()


                

            }
            else if(selecttype == 's'){
                $("#project_nav").text(' > '+treeNode.getParentNode().getParentNode().name)
                $("#location_nav").text(' > '+treeNode.getParentNode().name)
                $("#station_nav").text(' > '+treeNode.name)
                station_name = treeNode.name
                $("#project_name").text(treeNode.name)
                for(let i =0; i < find_station_edit_data.length; i++){
                    if(find_station_edit_data[i].station_name == treeNode.name){
                        station_id = find_station_edit_data[i].station_id
                    }
                
                }
                $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date());
                $('#termEnd').datepicker("option", "minDate", new Date())
                var today = new Date()

                year = today.getFullYear(); // 년도
                month = ('0'+ (today.getMonth() + 1)).slice(-2);  // 월
                date = ('0' + today.getDate()).slice(-2); 
                selectday = year+'-'+month+'-'+date
                termstart = year+'-'+month+'-'+date
                termend = year+'-'+month+'-'+date

                startday = $('#termStart').datepicker('getDate');
                endday  = $('#termEnd').datepicker('getDate');
                daydiff   = (endday - startday)/1000/60/60/24;
                $('#ratedate').val(10)

               
                selectgraph()
                datasave_date = treeNode.id
                tooltip_data_date()
            }
        }, 500);
    }


    termstart = selectday
    termend = selectday
    selectgraph()


    $('#plotType').on('change', 'input[type="radio"]', function(){
		// console.log($(this).closest('span').find('label').text())
        plotType = $(this).closest('span').find('label').text()

        
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

	$( "#termStart, #termEnd" ).attr('readonly',true);

    $( "#termStart" ).change(function(){
		var term = $('#termStart').datepicker("getDate")
		
		$('#termEnd').datepicker("option", "minDate", term)
        startday = $('#termStart').datepicker('getDate');
        endday   = $('#termEnd').datepicker('getDate');
      

        year = term.getFullYear(); // 년도
        month = ('0'+ (term.getMonth() + 1)).slice(-2);  // 월
        date = ('0' + term.getDate()).slice(-2); 
        termstart = year+'-'+month+'-'+date
        daydiff   = (endday - startday)/1000/60/60/24; 

        console.log(startday, endday)
        if(daydiff > 0){
            $('#ratedate').val((daydiff+1)*10)
            // $("#ratedate").attr("readonly",true);

            // $("#ratedate").attr("readonly",true);
        }else{
            $('#ratedate').val((daydiff+1)*10)
            // $("#ratedate").attr("readonly",false);

            // $("#ratedate").attr("readonly",false);
        }
       


	})

    $( "#termEnd" ).change(function(){
        
        var term = $('#termEnd').datepicker("getDate")

        year = term.getFullYear(); // 년도
        month = ('0'+ (term.getMonth() + 1)).slice(-2);  // 월
        date = ('0' + term.getDate()).slice(-2);
        endday   = $('#termEnd').datepicker('getDate');
        termend = year+'-'+month+'-'+date
        
        daydiff   = (endday - startday)/1000/60/60/24;
        
        if(daydiff > 0){
            $('#ratedate').val((daydiff+1)*10)
            // $("#ratedate").attr("readonly",true);
        }else{
            $('#ratedate').val((daydiff+1)*10)
            // $("#ratedate").attr("readonly",false);
        }
       
        
	})
    console.log(selectday.substr(8,10))
 
    var x = new Date(parseInt(selectday.substr(0,4)), parseInt(selectday.substr(5,7))-1, parseInt(selectday.substr(8,10)), 0, 0, 0, 0);
    $( "#termStart, #termEnd").datepicker( "setDate", x );
    $('#termEnd').datepicker("option", "minDate", x)
    

    // 처음화면 오늘 데이터
    // $("#termStart, #termEnd").datepicker().datepicker("setDate", new Date(selectday.substr(0,4), selectday.substr(5,7), 13, 0, 0, 0, 0));

    startday = x
    endday  = x
    daydiff   = (endday - startday)/1000/60/60/24;

    
    // 체크값에 따라 저장
    radiocheck = "PNG"
    $('#savetype').on('change', 'input[type="radio"]', function(){
        radiocheck = $(this).closest('span').find('label').text()
    });

    $('#savebtn').click(function(){
 
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

        console.log("tooltip_data_date_list", tooltip_data_date_list)
		$('#tooltip_table').empty()
        if(tooltip_data_date_list.length > 0 && tooltip_data_date_list.length < 11 ){
            console.log("!2")
            for(var i = 0 ; i < tooltip_data_date_list.length; i++){
                $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].monitoring_date+"</td></tr>")
            }
        }else if(tooltip_data_date_list.length > 10 && tooltip_data_date_list.length < 21 ){
            for(var i = 0 ; i < tooltip_data_date_list.length; i++){
                if(i < 10 && i+10 < tooltip_data_date_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].monitoring_date+"</td><td>"+tooltip_data_date_list[i+10].monitoring_date+"</td></tr>")
                }else if(i < 10 && i+10 >= tooltip_data_date_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].monitoring_date+"</td><tr>")
                }
                
            }
        }else if(tooltip_data_date_list.length > 20 && tooltip_data_date_list.length < 31 ){
            for(var i = 0 ; i < tooltip_data_date_list.length; i++){
                if(i < 10 && i+20 < tooltip_data_date_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].monitoring_date+"</td><td>"+tooltip_data_date_list[i+10].monitoring_date+"</td><td>"+tooltip_data_date_list[i+20].monitoring_date+"</td></tr>")
                }else if(i < 10 && i+20 >= tooltip_data_list.length){
                    $('#tooltip_table').append("<tr><td>"+ tooltip_data_date_list[i].monitoring_date+"</td><td>"+tooltip_data_date_list[i+10].monitoring_date+"</td><tr>")
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

            // console.log("222")
            var $this = $(this), 
            $href = "#tooltip—01",
            $top = $this.offset().top, 
            $left = $this.offset().left+ 200; 

            // console.log($top,$left);
        }
            
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
	//********************* TOOLTIP  끝 **********
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
			url: "/date/tooltip/monitoring?datasave="+datasave,
			async : false,
			success : function(json) {
				tooltip_data_list = json.data;
				// $('#project_name').text(edit_data[0].project_name)
				console.log(tooltip_data_list)
				console.log("HELLO")
                var data_length = tooltip_data_list.length
                console.log("LENGTH", tooltip_data_list.length)
                $('#tooltip_table').empty()
                if(tooltip_data_list.length > 0 && tooltip_data_list.length < 11 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td></td>")
                    }
                }else if(tooltip_data_list.length > 10 && tooltip_data_list.length < 21 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+10 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td></tr>")
                        }else if(i < 10 && i+10 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><tr>")
                        }
                        
                    }
                }else if(tooltip_data_list.length > 20 && tooltip_data_list.length < 31 ){
                    for(var i = 0 ; i < tooltip_data_list.length; i++){
                        if(i < 10 && i+20 < tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><td>"+tooltip_data_list[i+20].monitoring_date+"</td></tr>")
                        }else if(i < 10 && i+20 >= tooltip_data_list.length){
                            $('#tooltip_table').append("<tr><td>"+ tooltip_data_list[i].monitoring_date+"</td><td>"+tooltip_data_list[i+10].monitoring_date+"</td><tr>")
                        }
                        
                    }
                }
			},
			error: function(json){
				alert("tooltip_data error")
			}
		});
		
}

function tooltip_data_date(){
   
		$.ajax({
			type: "GET",
			url: "/date/tooltip/monitoring?datasave="+datasave_date,
			async : false,
			success : function(json) {
				tooltip_data_date_list = json.data;
				// $('#project_name').text(edit_data[0].project_name)
				console.log("툴팁",tooltip_data_date_list)
				
			},
			error: function(json){
				alert("tooltip_data error")
			}
		});
		
}



//이미지(png)로 다운로드
function downImg(){
    window.scrollTo(0,0)
    // var imagediv = document.getElementById("linechart")
    // var _transform = imagediv.style.transform;
    // console.log(_transform)
    // console.log(imagediv)

    // imagediv.style.setProperty("transform", "none")

    html2canvas($('#linechart')[0]).then(function(canvas){
        var todate = new Date();
        
        // console.log(todate.yyyymmddhhmmss())
        var myImage = canvas.toDataURL('image/png');
        downloadURI(myImage, todate+selectday +".png") 
    });
    // imagediv.style._transform
}

function downImg_jpg(){
    window.scrollTo(0,0)

    html2canvas($('#linechart')[0]).then(function(canvas){
        var todate = new Date();
        
        
        var myImage = canvas.toDataURL('image/png');
        downloadURI(myImage, todate +selectday +".jpg") 
    });

    // html2canvas($('#linechart')[0]).then(function(canvas){
    //     var todate = new Date();
        
        
    //     var myImage = canvas.toDataURL('image/png');
    //     downloadURI(myImage,".jpg") 
    // });
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
    doc.save(todate +selectday +'.pdf');
})};

function beforePrintHandler () {
    for (var id in Chart.instances) {
        Chart.instances[id].resize();
    }
}

// function test(){

// }
 
// function progress(){
//     $("#spinner_wrap").show();
// }

function selectgraph(){
    console.log(daydiff)
    ratedate = $('#ratedate').val()
    console.log(ratedate)
    if((daydiff+1)*10 >  ratedate){
        alert("선택된 DATE 기간의 UPDATE RATE는 "+(daydiff+1)*10 + " sec 이상이여야 합니다.")
        $("#ratedate").focus();
        $("#spinner_wrap").hide();
        return 
    }

 
    // console.log(ratedate) 
    // console.log(station_id)
    // console.log(termstart)
    // console.log(termend)

    let udp = "";
    for(let i=0; i <dataselect.length; i++){
        udp +=dataselect[i]
    }
    graphlabel = [];
    data_E =[];
    data_N =[];
    data_U =[];

    let data_E_udp1 = [];
    let data_N_udp1 = [];
    let data_U_udp1 = [];

    let data_E_udp2 = [];
    let data_N_udp2 = [];
    let data_U_udp2 = [];
    
    let data_E_udp3 = [];
    let data_N_udp3 = [];
    let data_U_udp3 = [];



    $.ajax({
        type: "POST",
        url: "/monitoring/station/data",
        async : false,
		data : {
			station_id : station_id,
            startdate : termstart,
            enddate : termend,
            ratedate : ratedate,
            udp : udp,
		},
        success : function(json) {
            edit_data = json.data;
    
            console.log(edit_data)

            for(var i = 0; i < edit_data.length; i++){
                data_E.push(edit_data[i].monitoring_E)
                data_N.push(edit_data[i].monitoring_N)
                data_U.push(edit_data[i].monitoring_U)
                if(graphlabel.indexOf(edit_data[i].monitoring_date) == -1 ){
                    graphlabel.push(edit_data[i].monitoring_date)

                    data_E_udp1.push({'x': edit_data[i].monitoring_date, 'y': null})
                    data_N_udp1.push({'x': edit_data[i].monitoring_date, 'y': null})
                    data_U_udp1.push({'x': edit_data[i].monitoring_date, 'y': null})

                    data_E_udp2.push({'x': edit_data[i].monitoring_date, 'y': null})
                    data_N_udp2.push({'x': edit_data[i].monitoring_date, 'y': null})
                    data_U_udp2.push({'x': edit_data[i].monitoring_date, 'y': null})

                    data_E_udp3.push({'x': edit_data[i].monitoring_date, 'y': null})
                    data_N_udp3.push({'x': edit_data[i].monitoring_date, 'y': null})
                    data_U_udp3.push({'x': edit_data[i].monitoring_date, 'y': null})


                }
            }

            for(let j=0; j<graphlabel.length; j++){

                for(let i=0; i < edit_data.length; i++){
                    
                    if(graphlabel[j] == edit_data[i].monitoring_date){
                        
                        if(edit_data[i].monitoring_udp_port == '65001'){       
                            let idx = graphlabel.indexOf(edit_data[i].monitoring_date)       
                           

                            if(idx != -1){
                                data_E_udp1[idx].y = edit_data[i].monitoring_E
                                data_N_udp1[idx].y = edit_data[i].monitoring_N
                                data_U_udp1[idx].y = edit_data[i].monitoring_U

                            }
                            
                         
                        }else if(edit_data[i].monitoring_udp_port == '65003'){
                            let idx = graphlabel.indexOf(edit_data[i].monitoring_date)       
                   

                            if(idx != -1){
                
                                data_E_udp2[idx].y = edit_data[i].monitoring_E
                                data_N_udp2[idx].y = edit_data[i].monitoring_N
                                data_U_udp2[idx].y = edit_data[i].monitoring_U

                            }


                            
                        }else if(edit_data[i].monitoring_udp_port == '65005'){

                            let idx = graphlabel.indexOf(edit_data[i].monitoring_date)       
  

                            if(idx != -1){
                                data_E_udp3[idx].y = edit_data[i].monitoring_E
                                data_N_udp3[idx].y = edit_data[i].monitoring_N
                                data_U_udp3[idx].y = edit_data[i].monitoring_U

                            }
                           
                        }
                    }
                    

                }

                

            }


        },
        error: function(error){
            console.log(error)
        }
    });


  
    

    let data_E_min = Math.round(Math.min(...data_E)*1000)/1000
    let data_E_max = Math.round(Math.max(...data_E)*1000)/1000
    let data_N_min = Math.round(Math.min(...data_N)*1000)/1000
    let data_N_max = Math.round(Math.max(...data_N)*1000)/1000
    let data_U_min = Math.round(Math.min(...data_U)*1000)/1000
    let data_U_max = Math.round(Math.max(...data_U)*1000)/1000
    // data_E_min = data_E_min.toFixed(2)
    console.log(data_U_min)
    if(data_E_min%0.002==0){
        data_E_min = Math.round((data_E_min - parseFloat(0.002))*1000)/1000
    }else{
        data_E_min = Math.round((data_E_min - parseFloat(0.001))*1000)/1000
    } 
    if(data_N_min%0.002==0){
        data_N_min = Math.round((data_N_min - parseFloat(0.002))*1000)/1000
    }else{
        data_N_min = Math.round((data_N_min - parseFloat(0.001))*1000)/1000
    } 
    if(data_U_min%0.002==0){
        data_U_min = Math.round((data_U_min - parseFloat(0.002))*1000)/1000
    }else{
        data_U_min = Math.round((data_U_min - parseFloat(0.001))*1000)/1000
    }
    if(data_E_max%0.002==0){
        data_E_max = Math.round((data_E_max + parseFloat(0.002))*1000)/1000
    }else{
        data_E_max = Math.round((data_E_max + parseFloat(0.001))*1000)/1000
    }
    if(data_N_max%0.002==0){
        data_N_max = Math.round((data_N_max + parseFloat(0.002))*1000)/1000
    }else{
        data_N_max = Math.round((data_N_max + parseFloat(0.001))*1000)/1000
    }
    if(data_U_max%0.002==0){
        data_U_max = Math.round((data_U_max + parseFloat(0.002))*1000)/1000
    }else{
        data_U_max = Math.round((data_U_max + parseFloat(0.001))*1000)/1000
    }

   

    datasets_E = [];
    datasets_N = [];
    datasets_U = [];
    // data_E_point = [];
    // data_N_point = [];
    // data_U_point = [];


  
    // for (let i =0 ;i<graphlabel.length; i++ ){
    //     data_E_point.push({'x':i,'y':data_E[i]})
    //     data_N_point.push({'x':i,'y':data_N[i]})
    //     data_U_point.push({'x':i,'y':data_U[i]})
    // }
    // console.log(data_E_point)
    // console.log("dataselect", dataselect)
    if(dataselect.indexOf('DDC01') != '-1'){
        datasets_E.push({
            label: 'UDP port1',
            backgroundColor: '#FF9933', 
            borderColor: '#FF9933', 
            data: data_E_udp1,
            borderWidth:1,
            spanGaps : true 
           
        }),
        datasets_N.push({
            label: 'UDP port1',
            backgroundColor: '#FF9933',
            borderColor: '#FF9933',
            data: data_N_udp1,
            borderWidth:1,
            spanGaps : true 
           
        }),
        datasets_U.push({
            label: 'UDP port1',
            backgroundColor: '#FF9933',
            borderColor: '#FF9933',
            data: data_U_udp1,
            borderWidth:1,
            spanGaps : true 
           
        })
    }

    if(dataselect.indexOf('DDC02') != '-1'){
        datasets_E.push({
            label: 'UDP port2',
            backgroundColor: '#FFFF00',
            borderColor: '#FFFF00',
            data: data_E_udp2,
            borderWidth:1,
            spanGaps : true 
        }),
        datasets_N.push({
            label: 'UDP port2',
            backgroundColor: '#FFFF00',
            borderColor: '#FFFF00',
            data: data_N_udp2,
            borderWidth:1,
            spanGaps : true 
            
        }),
        datasets_U.push({
            label: 'UDP port2',
            backgroundColor: '#FFFF00',
            borderColor: '#FFFF00',
            data: data_U_udp2,
            borderWidth:1,
            spanGaps : true 
        })
    }

    if(dataselect.indexOf('DDC03') != '-1'){
        datasets_E.push({
            label: 'UDP port3',
            backgroundColor: '#66FF00',
            borderColor: '#66FF00',
            data: data_E_udp3,
            borderWidth:1,
            spanGaps : true 
        }),
        datasets_N.push({
            label: 'UDP port3',
            backgroundColor: '#66FF00',
            borderColor: '#66FF00',
            data: data_N_udp3,
            borderWidth:1,
            spanGaps : true 
        }),
        datasets_U.push({
            label: 'UDP port3',
            backgroundColor: '#66FF00',
            borderColor: '#66FF00',
            data: data_U_udp3,
            borderWidth:1,
            spanGaps : true 
        })
    }
    
    if (plotType == "Point"){
        

        config_E= {
            type: 'line',
            data: {
                datasets: datasets_E,
            },
            options: {
                showLine: false,
                responsive : false,
                scales: {
                    y: {min: data_E_min,
                        max: data_E_max,
                        ticks:{
                            
                            stepSize : 0.002,
                            color: "#FFFFFF",
                            callback: function(val, index) {            
                                return index % 1 === 0 ? this.getLabelForValue(val) : '';
                            },
                            // callback: function(value, index, values) {
                            //     value = value+' m'
                            //             return  value;}
                          
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/7);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161",
                           
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 80; // sets the width to 100px
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
                        display: false,
                        // text: 'Custom Chart Title'
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"East[m]",
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
    
        config_N = {
            type: 'line',
            data: {
                datasets: datasets_N,
            },
            options: {
                showLine: false,
                responsive : false,
                scales: {
                    y: {
                        min: data_N_min,
                        max: data_N_max,
                        ticks:{
                            stepSize : 0.002,
                            color: "#FFFFFF",
                            callback: function(val, index) {
                                // Hide every 2nd tick label
                                return index % 1 === 0 ? this.getLabelForValue(val) : '';
                            },
                            // callback: function(value, index, values) {
                            //     value = value+' m'
                            //             return  value;}
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/7);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 80; // sets the width to 100px
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
                        display: false,
                        // text: 'Custom Chart Title'
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"North[m]",
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
    
        config_U = {
            type: 'line',
            data: {
                datasets: datasets_U,
            },
            options: {
                showLine: false,
                responsive : false,
                scales: {
                    y: {
                        min: data_U_min,
                        max: data_U_max,
                        ticks:{
                            stepSize : 0.002,
                            color: "#FFFFFF",
                            callback: function(val, index) {
                                // Hide every 2nd tick label
                                return index % 1 === 0 ? this.getLabelForValue(val) : '';
                            },
                            // callback: function(value, index, values) {
                            //     value = value+' m'
                            //             return  value;}
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/7);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 80; // sets the width to 100px
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
                        display: false,
                        // text: 'Custom Chart Title'
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"Up[m]",
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
                    // duration: 2000,
                    // onProgress: function(context) {
                    //     $("#spinner_wrap").show();
                    // },
                    onComplete : function(){
                        /*Your code here*/
                        $("#spinner_wrap").hide();
                     
                    }
                }
               
                
            }
        };
        
    }else{
        
        config_E= {
            type: 'line',
            data: {
            
                datasets: datasets_E
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
                        min: data_E_min,
                        max: data_E_max,
                        ticks:{
                            
                            stepSize : 0.002,
                            color: "#FFFFFF",
                            callback: function(val, index) {
                                // Hide every 2nd tick label
                                return index % 1 === 0 ? this.getLabelForValue(val) : '';
                            },
                            // callback: function(value, index, values) {
                            //     value = value+' m'
                            //             return  value;}
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/7);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            // tickMarkLength:10,
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 80; // sets the width to 100px
                          }
                    },
                    x: {
                        ticks: {
                            tickWidth: 20,
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
                        display: false,
                        // text: 'Custom Chart Title'
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"East[m]",
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
                // animation:{
                //     onProgress : function(animation){
                //         /*Your code here*/
                //         $("#spinner_wrap").show();
                     
                //     }
                // }
                
            }
        };
    
        config_N = {
            type: 'line',
            data: {
                datasets: datasets_N
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
                        min: data_N_min,
                        max: data_N_max,
                        ticks:{
                            stepSize : 0.002,
                            color: "#FFFFFF",
                            callback: function(val, index) {
                                // Hide every 2nd tick label
                                return index % 1 === 0 ? this.getLabelForValue(val) : '';
                            },
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/7);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161"
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 80; // sets the width to 100px
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
                        display: false,
                        // text: 'Custom Chart Title'
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"North[m]",
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
        config_U = {
            type: 'line',
            data: {
                datasets: datasets_U
            },
            options: {
                responsive : false,
                layout: {
                    padding: {
                        right: 10
                    }
                },
                scales: {
                    y: {min: data_U_min,
                        max: data_U_max,
                        ticks:{
                            
                            stepSize : 0.002,
                            color: "#FFFFFF",
                            callback: function(val, index) {
                                // Hide every 2nd tick label
                                return index % 1 === 0 ? this.getLabelForValue(val) : '';
                            },
                            // callback: function(value, index, values) {
                            //     value = value+' m'
                            //             return  value;}
                        },
                        afterBuildTicks: function(humdaysChart) {  
                            var now_tick = humdaysChart.ticks;
    
                            var tick_limit = Math.ceil(now_tick.length/7);
                            humdaysChart.ticks = [];
    
                            for(i=0;i<now_tick.length;i++){
                                if( (i % tick_limit) == 0){
                                    humdaysChart.ticks.push(now_tick[i]);
                                }
                            }
                        },
                        grid : {
                            color : "#616161",
                            // tickLength: 30,
                        },
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 80; // sets the width to 100px
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
                        display: false,
                        // text: 'Custom Chart Title'
                    },
                    title: {
                        display:true,
                        color:'#FFFFFF',
                        text:"Up[m]",
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
                    // duration: 2000,
                    // onProgress: function(context) {
                    //     $("#spinner_wrap").show();
                    // },
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
    console.log(myChart01)
    // console.log(data_N)

    let ctx = document.getElementById('myChart01')
 
    myChart01 = new Chart(
        ctx,
        config_E
    );

    myChart02 = new Chart(
    document.getElementById('myChart02'),
    config_N
    );

    myChart03 = new Chart(
    document.getElementById('myChart03'),
    config_U,
    // {onAnimationComplete: function() {
    //     $("#spinner_wrap").hide();
    //  }}
    );

    // var myNewChart = new Chart(ctx).Bar(data, {
    //     onAnimationComplete: function() {
    //        $("#save-btn").click();
    //     }
    //  });

    // $("#spinner_wrap").hide();

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
            // console.log("IN BLUE!!");
            $("#diyBtn_"+st_nodes[i].id).attr('src','/static/images/btn_blue.png')
        } else {
            // console.log("IN RED!!");
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