$(document).ready(function() {


  window.AppView = Backbone.View.extend({

    el: $("body"),
    rootSchemaPair: undefined,
    debugMode: false,

    jsonExample: '{\n\t"address":{\n\t\t"streetAddress": "21 2nd Street",\n\t\t"city":"New York"\n\t},\n\t"phoneNumber":\n\t[\n\t\t{\n\t\t\t"type":"home",\n\t\t\t"number":"212 555-1234"\n\t\t}\n\t]\n}',

    schemaExample: '{\n\t"$schema": "http://json-schema.org/draft-03/schema",\n\t"type": ["object","string"],\t\n\t"properties": {\n\t\t"geo": {"$ref": "http://jsonschema.net/examples/C.json"},\n\t\t"address": {\n\t\t\t"type": "object",\n\t\t\t"properties": {\n\t\t\t\t"city": {\n\t\t\t\t\t"type": "string"\n\t\t\t\t},\n\t\t\t\t"streetAddress": {\n\t\t\t\t\t"type": "string"\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\t\t"age":{\n\t\t\t"type": "number"\n\t\t}\n\t}\n}',

    basicJsonExample: '{}',
    basicSchemaExample: '{}',

    loadSchemaButton: 'Load schema',
    generateSchemaButton: 'Generate schema',

    initialize: function() {

      _.bindAll(this, 'resizeTextareas');
      $(window).bind('resize', this.resizeTextareas);

      this.initInputForm();
      this.generateSchema();
      this.showEditView();
      this.resizeTextareas();
    },

    initInputForm: function() {
      var inputType = $('form#Input input:[name=InputType]:checked').val();

      if (inputType === 'schema') {
        $('input#GenerateSchema').val(this.loadSchemaButton);
        $('form#Input textarea').val(this.schemaExample);
        $('form#Input span.JsonOptionsWrapper').hide();
        $('form#Input span.SchemaOptionsWrapper').show();
      } else {
        $('input#GenerateSchema').val(this.generateSchemaButton);
        $('form#Input textarea').val(this.jsonExample);
        $('form#Input span.SchemaOptionsWrapper').hide();
        $('form#Input span.JsonOptionsWrapper').show();
      }
    },

    doResize: function(elRef) {
      var viewportWidth = $(window).width();
      var viewportHeight = $(window).height();
      var newHeight = viewportHeight - elRef.offset().top - $('#footer').height();
      var buffer = 120;
      elRef.css('height', newHeight - buffer);
    },

    resizeLeft: function() {
      this.doResize($('form#Output textarea'));
    },

    resizeRight: function() {
      this.doResize($('form#Input textarea'));
    },

    resizeTextareas: function() {
      this.resizeRight();
      this.resizeLeft();
    },

    hideEditView: function() {
      $("#Edit").hide();
      $("#EditButton").attr('class', '');
    },

    hideReviewView: function() {
      $("#Review").hide();
      $("#ReviewButton").attr('class', '');
    },

    hideStringView: function() {
      $("#String").hide();
      $("#StringButton").attr('class', '');
    },

    hideErrorView: function() {
      $("#Error").hide();
    },

    showErrorView: function() {
      this.hideReviewView();
      this.hideStringView();
      this.hideEditView();
      $("#Error").show();
    },

    showEditView: function() {
      /* Do NOT construct edit view each time 
      it's displayed. */
      this.hideReviewView();
      this.hideStringView();
      this.hideErrorView();
      $("#Edit").show();
      $("#EditButton").attr('class', 'selected');
    },

    showReviewView: function() {
      /* Review view is quick to construct, so render it 
      every time it's displayed to ensure it's sync'd with 
      edit view. Future implementation should keep all views 
      in sync using Backbone events. */
      this.renderReviewView();

      this.hideEditView();
      this.hideStringView();
      this.hideErrorView();
      $("#Review").show();
      $("#ReviewButton").attr('class', 'selected');
    },

    showStringView: function() {
      /* String view is quick to construct, so render it 
      every time it's displayed to ensure it's sync'd with 
      edit view. Future implementation should keep all views 
      in sync using Backbone events. */
      this.renderStringView();

      this.hideEditView();
      this.hideReviewView();
      this.hideErrorView();
      $("#String").show();
      $("#StringButton").attr('class', 'selected');
    },

    renderErrorView: function(err) {

      var txt = 'There was an error in the input you provided.<br />';
      txt += 'Error message: <strong>' + err.message + '</strong> <br />';

      var vDebug = '';
      for (var prop in err) 
      {  
         vDebug += "property: "+ prop+ " value: ["+ err[prop]+ "]<br />"; 
      } 

      vDebug += "Error toString(): " + err.toString(); 

      txt += vDebug; 

      $('div#Error').empty();
      $('div#Error').append(txt);
    },

    renderEditView: function() {
      this.render();
    },

    render: function() {
      if (!this.rootSchemaPair) {
        return;
      }

      var rootSchemaPairView = new SchemaPairV({
        model: this.rootSchemaPair
      });

      $('#Edit').empty();
      $('#Edit', this.el).append(rootSchemaPairView.render().el);
      this.resizeTextareas();
    },

    renderReviewView: function() {
      if (!this.rootSchemaPair) {
        return;
      }

      var spStaticV = new SchemaPairStaticV({
        model: this.rootSchemaPair
      });

      $('form#Output textarea').val(spStaticV.render());
      this.resizeTextareas();
    },

    renderStringView: function() {
      if (!this.rootSchemaPair) {
        return;
      }

      var spStaticV = new SchemaPairStrV({
        model: this.rootSchemaPair
      });

      $('div#String').empty();
      $('div#String').append(spStaticV.render());
      this.resizeTextareas();
    },

    generateSchema: function() {
      JsonSchema.RESOLVE_REFS = $('form#Input input:[name=ResolveRef]').is(':checked');
      JsonSchema.MERGE_EXTS = $('form#Input input:[name=MergeExt]').is(':checked');;
      JsonSchema.INCLUDE_DEFS = $('form#Input input:[name=IncludeDefaults]').is(':checked');
      JsonSchema.INPUT_VALUE = $('form#Input textarea').val();
      JsonSchema.INPUT_MODE = $('form#Input input:[name=InputType]:checked').val();
      JsonSchema.VERBOSE = $('form#Input input:[name=Verbose]:checked').val();
      JsonSchema.DEBUG_MODE = this.debugMode;

      var rootSchema = null;

      if (this.debugMode) {
        // Let browser handle any exceptions.
        rootSchema = JsonSchema.GenerateSchema();
      } else {
          try {
            rootSchema = JsonSchema.GenerateSchema();
          } catch (err) {
            this.renderErrorView(err);
            this.showErrorView();
            return;
          }
      }
  
      this.rootSchemaPair = new SchemaPair({
        schema: rootSchema,
        root: true
      });

      this.rootSchemaPair.constructId();
    
      this.renderEditView();
      this.showEditView();
    },

    resetInputForm: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      $('form#Input').each(function() {
        this.reset();
      });

      this.initInputForm();
      this.resizeTextareas();

    },

    collapseExpand: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      $(e.target).toggleClass('expanded');
      $(e.target).toggleClass('collapsed');

      var expanded = !$('div#mainright').is(':visible');

      if (expanded) {

        $('div#mainleft').animate({
          width: '50%'
        }, 500, function() {
          $('div#mainright').show();
        });

      } else {
        $('div#mainright').hide();

        $('div#mainleft').animate({
          width: '100%'
        }, 500);
      }
    },

    events: {
      "click input#GenerateSchema": "generateSchema",
      "click input#ResetInputForm": "resetInputForm",
      "click form#Input input:[name=InputType]": "initInputForm",
      "click a#ReviewButton": "showReviewView",
      "click a#EditButton": "showEditView",
      "click a#StringButton": "showStringView",
      "click a#ExpandButton": "collapseExpand"
    }
  });

  var appview = new AppView();
});
