
$.getJSON("/saved/articles", function(data) {

	for (var i = 0; i < data.length; i++) {

      var newDiv = '<div class="panel panel-default container-fluid">' +
	    '<div class="panel-heading row">' +
	    '<h3 class="panel-title pull-left">' + data[i].title +
	    '</h3>' +
	    '<button id="unsaveBtn" data-id="' + data[i]._id + '" class="btn btn-default pull-right">' + 'Delete From Saved' + '</button>' +
	    '<button id="notesBtn" data-id="' + data[i]._id + '" class="btn btn-default pull-right">' + 'Article Notes' + '</button>' +
	    '</div>' +
	    '<div class="panel-body pull-left">' + '<p>' + data[i].summary + '</p><br>' +
        '<p>URL: ' + data[i].link + '</p>' +
	    '</div>';

	  	$("#articles-list").append(newDiv);
	}

});


// when click to add note for articles
// pop up modal
// input text for note
// then click save note button (modal)

$(document).on("click", "#notesBtn", function() {

  var thisId = $(this).attr("data-id");
  
	var newDivModal = 
    '<div id="notesModal" class="modal fade" role="dialog">' +
    '<div class="modal-dialog" role="document">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
    '<h4 class="modal-title">Notes For Article: ' + thisId + '</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '<div id="articleNotes" class="well">No Notes For this Article Yet</div>' +          
    '<div class="form-group">' +
    '<label for="note">New Note:</label>' +
    '<textarea class="form-control" rows="3" id="textNote"></textarea>' +
    '</div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button type="button" id="saveNote" data-id=' + thisId + ' class="btn btn-default" data-dismiss="modal">Save Note</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>'

    $("#showModal").append(newDivModal);
    
  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
    .done(function(data) {
      if (data.note) {       
        // Place the body of the note in the body textarea
        
        $("#articleNotes").empty();
        $("#articleNotes").append(data.note.body);
      }
    });

    $("#notesModal").modal();

});


$(document).on("click", "#saveNote", function() {

	var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
    // Value taken from note textarea
      body: $("#textNote").val() 
    }
  })
    // With that done
    .done(function(data) {
    // Log the response
      console.log(data);
            
    });

    $("#textNote").val("");

});


// when click Delete From Saved button
// set saved to false
// remove from saved DOM 

$(document).on("click", "#unsaveBtn", function() {

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "saved/articles/" + thisId,
    data: {
      saved: false
    }
  })
  .done(function(data) {  
    console.log(data);

  });

  $(this).parent().parent().remove();

});