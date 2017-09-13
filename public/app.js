 // When user clicks Scrape New Article Button
$(document).on("click", "#scrapeBtn", function () {
	
  $("#scrapeModal").modal();

	$.getJSON("/scrape", function(data) {
		
	  // For each one
		for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
	   	var newDiv = '<div class="panel panel-default container-fluid">' +
	           '<div class="panel-heading row">' +
	           '<h3 class="panel-title pull-left">' + data[i].title +
	           '</h3>' +
	           '<button id="saveBtn" data-id="' + data[i]._id + '" class="btn btn-default pull-right">' + 'Save Article' + '</button>' +
	           '</div>' +
	           '<div class="panel-body pull-left">' + '<p>' + data[i].summary + '</p><br>' +
             '<p>URL: ' + data[i].link + '</p>' +
	           '</div>';

	  	$("#articles-list").append(newDiv);
	  }

	});
  
});


// When user clicks "Saved Articles",  and remove the article.
$(document).on("click", "#saveBtn", function() {	
  
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
      
	$.ajax({
    method:"POST",
    url: "/saved/",
    data: { id: thisId }
  }).done(function (data) {        
    console.log(data);

    });
});
