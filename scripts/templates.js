(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['binding_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<iframe scrolling=\"no\" \n		frameborder=\"0\" \n		marginwidth=\"0\" \n		marginheight=\"0\" \n		width=\"100%\" \n		height=\"100%\" \n		class='binding-sandbox'>\n</iframe>";});
templates['extracting_item_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h5>";
  foundHelper = helpers.log_message;
  stack1 = foundHelper || depth0.log_message;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "log_message", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h5>\n<div class=\"progress progress-striped progress-success active \">	\n		<div role=\"status\" aria-live=\"assertive\" aria-relevant=\"all\" class=\"bar\" style=\"width: ";
  foundHelper = helpers.progress;
  stack1 = foundHelper || depth0.progress;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "progress", { hash: {} }); }
  buffer += escapeExpression(stack1) + "%;\"></div>\n</div>";
  return buffer;});
templates['fixed_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"fixed-page-margin\">\n	<iframe scrolling=\"no\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"";
  foundHelper = helpers.width;
  stack1 = foundHelper || depth0.width;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "width", { hash: {} }); }
  buffer += escapeExpression(stack1) + "px\" \n			height=\"";
  foundHelper = helpers.height;
  stack1 = foundHelper || depth0.height;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "height", { hash: {} }); }
  buffer += escapeExpression(stack1) + "px\" \n			src=\"";
  foundHelper = helpers.uri;
  stack1 = foundHelper || depth0.uri;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "uri", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"\n			class='content-sandbox'>\n	</iframe>\n</div>";
  return buffer;});
templates['image_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"fixed-page-margin\">\n	<img src=\"";
  foundHelper = helpers.uri;
  stack1 = foundHelper || depth0.uri;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "uri", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" >\n</div>";
  return buffer;});
templates['library_item_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class='info-wrap clearfix'>\n	<div class='caption book-info'>\n		<h2 class='green info-item title'>";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.title);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2>\n		<div class='info-item author'>";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.author);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		<div class='info-item epub-version'>ePUB ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.epub_version);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		\n	</div>\n	\n	<img class='cover-image read' src='";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.cover_href);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.cover_href", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' width='150' height='220' alt='Open ePUB ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.title);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'>\n	\n	<a href=\"#details-modal-";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.key);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.key", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"info-icon\" data-toggle=\"modal\" role=\"button\">\n		<img class='info-icon pull-right' src='/images/library/info-icon.png' height=\"39px\" width=\"39px\" alt='";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.title);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + " information'>\n	</a>\n</div>\n\n<div class=\"caption clearfix buttons\">\n	<a href=\"#todo\" class=\"btn read\" data-book='";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.key);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.key", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' role='button'>Read</a>\n	<a href=\"#details-modal-";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.key);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.key", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"btn details\" data-toggle=\"modal\" role=\"button\">\n		Details\n	</a>\n</div>\n\n<div id='details-modal-";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.key);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.key", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' class='modal fade details-modal'>\n	<div class=\"pull-left modal-cover-wrap\">\n		<img class='details-cover-image' src='";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.cover_href);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.cover_href", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' width='150' height='220' alt='ePUB cover'>\n		<div class=\"caption clearfix modal-buttons\">\n</div>\n	</div>\n	<div class='caption modal-book-info'>\n		<h3 class='green modal-title'>";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.title);
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\n		<div class='modal-detail gap'>Author: ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.author);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>Publisher: ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.publisher);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>Pub Date: ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.pubdate);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>Modified Date: ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.modified_date);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail gap'>ID: ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.id);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail green'>Format: ePUB ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.epub_version);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>Added: ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.created_at);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</div>\n	</div>\n	<div class='modal-detail source'>\n	<span class='green' style=\"padding-right: 10px\">Source:</span>\n		";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.src_url);
  foundHelper = helpers.orUnknown;
  stack2 = foundHelper || depth0.orUnknown;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "orUnknown", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "\n	</div>\n</div>			";
  return buffer;});
templates['library_items_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<div id='empty-message'>\n	<p id='empty-message-text' class='green'>\n		Add items to your</br>library here!\n	</p>\n	<img id='empty-arrow' src='/images/library/empty_library_arrow.png' alt='' />\n</div>";});
templates['ncx_nav_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<li class=\"nav-elem\">\n	<a href=\"";
  foundHelper = helpers.href;
  stack1 = foundHelper || depth0.href;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "href", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.text;
  stack1 = foundHelper || depth0.text;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a>\n</li>";
  return buffer;});
templates['reflowing_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div id=\"flowing-wrapper\">\n	<iframe scrolling=\"no\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"50%\" \n			height=\"100%\" \n			src=\"";
  foundHelper = helpers.uri;
  stack1 = foundHelper || depth0.uri;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "uri", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"\n			id=\"readium-flowing-content\">\n	</iframe>\n</div>";
  return buffer;});
templates['scrolling_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div id=\"scrolling-content\" class=\"scrolling-page-wrap\">\n	<div class=\"scrolling-page-margin\">\n\n		<iframe scrolling=\"yes\" \n				frameborder=\"0\" \n				marginwidth=\"0\" \n				marginheight=\"0\" \n				width=\"100%\" \n				height=\"100%\" \n				src=\"";
  foundHelper = helpers.uri;
  stack1 = foundHelper || depth0.uri;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "uri", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"\n				class='content-sandbox'>\n		</iframe>\n	</div>\n</div>";
  return buffer;});
})();