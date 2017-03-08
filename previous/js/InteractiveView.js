$(document).ready(function() {

    OptionsV = Backbone.View.extend({

        tagName: 'form',
        className: 'SchemaOptions',
        name: 'SchemaOptions',

        events: {
            'click': 'handleOptionsFocus',
            'click input:checkbox[name=Type]': 'handleOptionsTypeUpdate',
            'click input.Save': 'handleSaveOptions',
            'click input.Reset': 'handleResetOptions',
        },

        initialize: function() {
            _.bindAll(this, 'render');
            _.bindAll(this, 'handleOptionsFocus');
            _.bindAll(this, 'handleOptionsFocus');
            _.bindAll(this, 'handleOptionsTypeUpdate');
            _.bindAll(this, 'handleSaveOptions');
            _.bindAll(this, 'handleResetOptions');
            _.bindAll(this, 'optionsValueError');
        },

        handleOptionsFocus: function(e) {
            e.stopImmediatePropagation();
        },

        optionsValueError: function(model, error) {
            $(OptionsV.ERROR_REF, this.el).show();
        },

        handleOptionsTypeUpdate: function(e) {
            e.stopImmediatePropagation();

            var self = this;
            var inputTypesRef = $(OptionsV.INPUT_TYPES_REF, this.el);

            inputTypesRef.each(function() {

                var checked = $(this).is(':checked');
                var type = $(this).val();

                if (checked) {
                    if (type == TypeEnum.NUMBER) {
                        $(OptionsV.NUMBER_OPTIONS_REF, self.el).show();
                    } else if (type == TypeEnum.ARRAY) {
                        $(OptionsV.ARRAY_OPTIONS_REF, self.el).show();
                    }
                } else {
                    if (type == TypeEnum.NUMBER) {
                        $(OptionsV.NUMBER_OPTIONS_REF, self.el).hide();
                        $(OptionsV.INPUT_MINIMUM_REF, self.el).val('');
                        $(OptionsV.INPUT_MAXIMUM_REF, self.el).val('');
                    } else if (type == TypeEnum.ARRAY) {
                        $(OptionsV.ARRAY_OPTIONS_REF, self.el).hide();
                        $(OptionsV.INPUT_ITEM_SPACES_REF, self.el).val('');
                        $(OptionsV.INPUT_MIN_ITEMS_REF, self.el).val('');
                        $(OptionsV.INPUT_MAX_ITEMS_REF, self.el).val('');
                    }
                }
            });
        },

        handleSaveOptions: function(e) {
            e.stopImmediatePropagation();

            var schema = this.model.get('schema');

            // Assume no errors.
            var errorRef = $(OptionsV.ERROR_REF, this.el);
            errorRef.hide();

            // We're setting user values on both the Schema Pair and Schema.
            schema.on('error', this.optionsValueError);
            this.model.on('error', this.optionsValueError);

            /* Was this Options dialog for an Item or Property?
            There will would not be an input field for Key if it was an Item. */
            var keyRef = $(OptionsV.INPUT_KEY_REF, this.el);
            var propertySchema = keyRef.is(':visible');

            if (propertySchema) {
                var keyVal = $(OptionsV.INPUT_KEY_REF, this.el).val();
                keyVal = jQuery.trim(keyVal);
                this.model.set({
                    key: keyVal
                });
            }

            var dollarSchemaVal = $(OptionsV.INPUT_SCHEMA_REF, this.el).val();
            var dollarRefVal = $(OptionsV.INPUT_REFERENCE_REF, this.el).val();
            var descriptionVal = $(OptionsV.INPUT_DESCRIPTION_REF, this.el).val();
            var titleVal = $(OptionsV.INPUT_TITLE_REF, this.el).val();
            var nameVal = $(OptionsV.INPUT_NAME_REF, this.el).val();
            var schemaIdVal = $(OptionsV.INPUT_SCHEMA_ID_REF, this.el).val();
            var minimumVal = $(OptionsV.INPUT_MINIMUM_REF, this.el).val();
            var maximumVal = $(OptionsV.INPUT_MAXIMUM_REF, this.el).val();
            var minItemsVal = $(OptionsV.INPUT_MIN_ITEMS_REF, this.el).val();
            var maxItemsVal = $(OptionsV.INPUT_MAX_ITEMS_REF, this.el).val();
            var requiredVal = $(OptionsV.INPUT_REQUIRED_REF, this.el).is(':checked') ? true : false;

            schema.set({
                types: typesVal,
                dollarschema: dollarSchemaVal,
                dollarref: dollarRefVal,
                description: descriptionVal,
                schemaid: schemaIdVal,
                title: titleVal,
                name: nameVal,
                required: requiredVal,
                minimum: minimumVal,
                maximum: maximumVal,
                minitems: minItemsVal,
                maxitems: maxItemsVal
            });

            var typesRef = $(OptionsV.INPUT_TYPES_REF, this.el).filter(':checked');
            var typesVal = new TypeList();

            typesRef.each(function() {
                var t = new Type({
                    t: $(this).val()
                });
                typesVal.add(t);
            });
            schema.set({'type':typesVal});

            var error = errorRef.is(':visible');
            if (error) {
                return;
            }

            /* If schema is no longer an array,
            remove any schema items from it. */
            if (!typesVal.isArray()) {
                schema.clearItems();
            }

            // Hide Options form now saving is done.
            $(this.el).remove();
            // Schema View needs to display new values.
            this.model.get('schema').trigger('updated:Schema');
            /* Schema Pair View needs to update it's UI too since 'Key' 
            may have changed. */
            this.model.get('schema').trigger('saved:Schema');
        },

        handleResetOptions: function(e) {
            e.stopImmediatePropagation();

            $(this.el).each(function() {
                this.reset();
            });

            $(OptionsV.ERROR_REF, this.el).hide();
            // Type sensitive input fields also need to be reset.
            this.handleOptionsTypeUpdate(e);
        },

        render: function() {

            $(this.el).empty();
            var schema = this.model.get('schema');

            var v = {
                // From Model
                Key: this.model.get('key'),
                // From Model.Schema
                Schema: schema.get('dollarschema'),
                Reference: schema.get('dollarref'),
                CheckRequired: schema.get('required') ? 'checked' : '',
                Minimum: schema.get('minimum'),
                Maximum: schema.get('maximum'),
                MinItems: schema.get('minitems'),
                MaxItems: schema.get('maxitems'),
                Description: schema.get('description'),
                Title: schema.get('title'),
                SchemaId: schema.get('schemaid'),
                Name: schema.get('name'),
                CheckObject: schema.get('type').isObject() ? 'checked' : '',
                CheckString: schema.get('type').isString() ? 'checked' : '',
                CheckNumber: schema.get('type').isNumber() ? 'checked' : '',
                CheckInteger: schema.get('type').isInteger() ? 'checked' : '',
                CheckBoolean: schema.get('type').isBoolean() ? 'checked' : '',
                CheckArray: schema.get('type').isArray() ? 'checked' : '',
                CheckNull: schema.get('type').isNull() ? 'checked' : '',
                CheckAny: schema.get('type').isAny() ? 'checked' : ''
            };

            var load = !Templates['options'];
            if (load) {
                Templates['options'] = $(OptionsV.TEMPLATE).html();
            }

            var t = _.template(Templates['options'], v);
            $(this.el).append(t);

            var types = this.model.get('schema').get('type');

            // Show type sensitive input fields.
            if (!types.isNumber()) {
                $(OptionsV.NUMBER_OPTIONS_REF, this.el).hide();
            }

            if (!types.isArray()) {
                $(OptionsV.ARRAY_OPTIONS_REF, this.el).hide();
            }

            if (!v.Key) {
                // It's an Item and Items don't have keys.
                $(OptionsV.KEY_OPTIONS_REF, this.el).hide();
            }

            $('div.tabs', this.el).tabs();
            return this;
        }
    }, {
        TEMPLATE: '#SchemaOptionsView-Template',
        /* We don't need :first for any of these since Options dialogs don't 
        contain nested Options dialogs. */
        ARRAY_OPTIONS_REF: 'li.OptArray',
        KEY_OPTIONS_REF: 'li.OptKey',
        NUMBER_OPTIONS_REF: 'li.OptNumber',
        INPUT_TYPES_REF: 'input:checkbox[name=Type]',
        INPUT_MINIMUM_REF: 'input.Minimum',
        INPUT_MAXIMUM_REF: 'input.Maximum',
        INPUT_MIN_ITEMS_REF: 'input.MinItems',
        INPUT_MAX_ITEMS_REF: 'input.MaxItems',
        INPUT_TITLE_REF: 'input.Title',
        INPUT_NAME_REF: 'input.Name',
        INPUT_KEY_REF: 'input.Key',
        INPUT_SCHEMA_ID_REF: 'input.SchemaId',
        INPUT_DESCRIPTION_REF: 'input.Description',
        INPUT_REFERENCE_REF: 'input.Reference',
        INPUT_SCHEMA_REF: 'input.Schema',
        INPUT_REQUIRED_REF: 'input.Required',
        ERROR_REF: 'li.OptError',
    });


    /* Schema View renders a single Schema between braces and delimiters
    between schema attributes.
    <ul>{ 
        <li>attribute:value,<li>
        <li>attribute:value,<li>
        ...
    }</ul>
    */
    SchemaV = Backbone.View.extend({
        tagName: 'ul',
        className: 'SchemaView',
        datalevel: 0,

        initialize: function() {
            _.bindAll(this, 'render');
            _.bindAll(this, 'handleSchemaUpdated');
            _.bindAll(this, 'handlePropertyRemoved');
            _.bindAll(this, 'handleItemRemoved');
            _.bindAll(this, 'handleAddProperty');
            _.bindAll(this, 'handleAddExtension');
            _.bindAll(this, 'handleAddItem');
            _.bindAll(this, 'handleExtensionRemoved');

            // Notification from Options dialog of new schema values.
            this.model.bind('updated:Schema', this.handleSchemaUpdated);
            // Request from Schema Pair to add a child Schema Pair to Items.
            this.model.bind('add:Item', this.handleAddItem);
            // Request from Schema Pair to add a child Schema Pair to Properties.
            this.model.bind('add:Property', this.handleAddProperty);
            // Request from Schema Pair to add Extension to schema.
            this.model.bind('add:Extension', this.handleAddExtension);
        },

        setLevel: function(aLevel) {
            this.datalevel = aLevel;
        },

        /* This probably isn't very efficient, but it isn't used 
        during any rendering, so acceptable.*/
        attributeDelimiterCheck: function() { /* All attribute delimiters that belong to a visible schema attribute of this schema only. */
            var selector = ('li[data-level="' + this.datalevel + '"]:visible > span.AttributeDelimiter');
            //var selector = ('span.AttributeDelimiter[data-level="' + this.datalevel + '"]');
            var attributes = $(selector, this.el);

            for (var i = 0; i < attributes.length; i++) {
                var lastAttributeDelimiter = (i == attributes.length - 1);
                if (lastAttributeDelimiter) {
                    $(attributes[i]).hide();
                } else {
                    $(attributes[i]).show();
                }
            }
        },

        handleSchemaUpdated: function() {

            var v = {
                DollarSchema: this.model.get('dollarschema'),
                DollarRef: this.model.get('dollarref'),
                Types: this.model.get('type'),
                Title: this.model.get('title'),
                Name: this.model.get('name'),
                Required: this.model.get('required'),
                Description: this.model.get('description'),
                SchemaId: this.model.get('schemaid'),
                Minimum: this.model.get('minimum'),
                Maximum: this.model.get('maximum'),
                MinItems: this.model.get('minitems'),
                MaxItems: this.model.get('maxitems'),
                DefaultValue: this.model.get('defaultValue'),
                DataLevel: this.datalevel,
            };

            var levelAttr = ('[data-level="' + this.datalevel + '"]');
            var t = _.template($(SchemaV.TEMPLATE).html(), v);

            // Remove types
            $(SchemaV.TYPES_REF + levelAttr, this.el).remove();

            // Remove simple attributes
            var obj = _.pick(SchemaAttributes, this.model.simpleKeysWithVal());

            for (var key in obj) {
                var attrObj = obj[key];
                $(attrObj['ref'] + levelAttr, this.el).remove();
            }

            /* Types are the only complex attribute which can be 
            modified from Options dialog. */
            $(this.el).prepend(t);

            if (v.Types.length > 0) {
                var tlv = new TypeLV({
                    collection: v.Types
                });
                tlv.setLevel(this.datalevel);
                /* Prepend to keep Properties and Items appearing last. 
                Types also generally appear first. */
                $(this.el).prepend(tlv.render().el);
            }

            // Simple attributes.
            var obj = _.pick(SchemaAttributes, this.model.simpleKeysWithVal());

            for (var key in obj) {
                var attrObj = obj[key];
                var attrName = attrObj['name'];
                var attrHtmlRef = attrObj['ref'];

                $(attrHtmlRef + levelAttr, this.el).show();
                last = attrHtmlRef;
            }

            this.attributeDelimiterCheck();
        },

        /* Collection of Items may not exist, so Schema View gets a chance 
        to create it before assignig the real work to the Collection View. */
        handleAddItem: function() {
            var items = this.model.get('items');
            var newItem = (items.length <= 0);

            if (newItem) {
                var cache = $(SchemaV.ITEMS_REF, this.el);
                var itemsSPLView = new SchemaPairLV({
                    collection: items,
                    className: 'Items'
                });
                itemsSPLView.datalevel = this.datalevel;
                $(this.el).append(itemsSPLView.render().el);
                items.bind('removed:SchemaPair', this.handleItemRemoved);
            }

            // The UI element has been created, now do the real work.
            items.trigger('add:SchemaPair');

            /* Only need to check delimiters if the 'items' attribute of 
            the schema wasn't already present. */
            if (newItem) {
                this.attributeDelimiterCheck();
            }
        },

        handleAddExtension: function() {
            var extensions = this.model.get('extensions');
            var newExtension = (extensions.length <= 0);

            if (newExtension) {
                var cache = $(SchemaV.EXTENSIONS_REF, this.el);
                var extensionsSPLView = new SchemaPairLV({
                    collection: extensions,
                    className: 'Extensions'
                });
                extensionsSPLView.datalevel = this.datalevel;
                $(this.el).append(extensionsSPLView.render().el);
                extensions.bind('removed:SchemaPair', this.handleExtensionRemoved);
            }

            // The UI element has been created, now do the real work.
            extensions.trigger('add:SchemaPair');

            /* Only need to check delimiters if the 'items' attribute of 
            the schema wasn't already present. */
            if (newExtension) {
                this.attributeDelimiterCheck();
            }

        },

        /* Collection of Properties may not exist, so Schema View gets a chance 
        to create it before assignig the real work to the Collection View. */
        handleAddProperty: function() {

            var properties = this.model.get('properties');
            var newProperty = (properties.length <= 0);

            if (newProperty) {
                var propertiesSPLView = new SchemaPairLV({
                    collection: properties,
                    className: 'Properties'
                });
                propertiesSPLView.setLevel(this.datalevel);
                $(this.el).append(propertiesSPLView.render().el);
                properties.bind('removed:SchemaPair', this.handlePropertyRemoved);
            }

            // The UI element has been created, now do the real work.
            properties.trigger('add:SchemaPair');

            /* Only need to check delimiters if the 'property' attribute of 
            the schema wasn't already present. */
            if (newProperty) {
                this.attributeDelimiterCheck();
            }
        },

        handleExtensionRemoved: function() {
            var extensions = this.model.get('extensions');
            var empty = (extensions.length <= 0);

            if (empty) {
                extensions.unbind('removed:SchemaPair');
                this.attributeDelimiterCheck();
            }
        },

        handlePropertyRemoved: function() {
            var properties = this.model.get('properties');
            var empty = (properties.length <= 0);

            if (empty) {
                properties.unbind('removed:SchemaPair');
                this.attributeDelimiterCheck();
            }
        },

        handleItemRemoved: function() {
            var items = this.model.get('items');
            var empty = (items.length <= 0);

            if (empty) {
                items.unbind('removed:SchemaPair');
                this.attributeDelimiterCheck();
            }
        },

        render: function() {

            $(this.el).empty();
            $(this.el).attr("data-level", this.datalevel);

            var v = {
                DollarSchema: this.model.get('dollarschema'),
                DollarRef: this.model.get('dollarref'),
                Types: this.model.get('type'),
                Title: this.model.get('title'),
                Name: this.model.get('name'),
                Required: this.model.get('required'),
                Description: this.model.get('description'),
                Properties: this.model.get('properties'),
                Extensions: this.model.get('extensions'),
                Items: this.model.get('items'),
                SchemaId: this.model.get('schemaid'),
                Minimum: this.model.get('minimum'),
                Maximum: this.model.get('maximum'),
                MinItems: this.model.get('minitems'),
                MaxItems: this.model.get('maxitems'),
                DefaultValue: this.model.get('defaultValue'),
                DataLevel: this.datalevel,
            };

            var last = null;

            var load = !Templates['schema'];
            if (load) {
                Templates['schema'] = $(SchemaV.TEMPLATE).html();
            }
            var t = _.template(Templates['schema'], v);

            $(this.el).append(t);

            // Simple attributes.
            var obj = _.pick(SchemaAttributes, this.model.simpleKeysWithVal());

            for (var key in obj) {
                var attrObj = obj[key];
                var attrName = attrObj['name'];
                var attrHtmlRef = attrObj['ref'];

                $(attrHtmlRef, this.el).show();
                last = attrHtmlRef;
            }

            // Complex attributes (types, properties, items, extensions).
            if (v.Types.length > 0) {
                var tlv = new TypeLV({
                    collection: v.Types
                });
                tlv.setLevel(this.datalevel);
                $(this.el).append(tlv.render().el);
                last = SchemaV.TYPES_REF;
            }

            var unattachedE = undefined;
            if (v.Extensions.length > 0) {
                var eSPLView = new SchemaPairLV({
                    collection: v.Extensions,
                    className: 'Extensions'
                });
                eSPLView.setLevel(this.datalevel);
                unattachedE = eSPLView.render().el;
                v.Extensions.bind('removed:SchemaPair', this.handleExtensionRemoved);
            }

            var unattachedP = undefined;
            if (v.Properties.length > 0) {
                var pSPLView = new SchemaPairLV({
                    collection: v.Properties,
                    className: 'Properties'
                });
                pSPLView.setLevel(this.datalevel);
                unattachedP = pSPLView.render().el;
                v.Properties.bind('removed:SchemaPair', this.handlePropertyRemoved);
            }

            var unattachedI = undefined;
            if (v.Items.length > 0) {
                var iSPLView = new SchemaPairLV({
                    collection: v.Items,
                    className: 'Items'
                });
                iSPLView.setLevel(this.datalevel);
                unattachedI = iSPLView.render().el;
                v.Items.bind('removed:SchemaPair', this.handleItemRemoved);
            }

            if (unattachedP) {
                $(this.el).append(unattachedP);
                last = SchemaV.PROPERTIES_REF;
            }

            if (unattachedI) {
                $(this.el).append(unattachedI);
                last = SchemaV.ITEMS_REF;
            }

            if (unattachedE) {
                $(this.el).append(unattachedE);
                last = SchemaV.EXTENSIONS_REF;
            }

            if (last) {
                var lastEl = $(last, this.el);
                var x = $('span.AttributeDelimiter[data-level="' + this.datalevel + '"]', lastEl);
                x.filter(':last').css('display', 'none');
            }
            return this;
        }
    }, {
        TEMPLATE: '#SchemaView-Template',
        OPTIONS_REF: 'li.Options',
        TYPES_REF: 'li.Types',
        PROPERTIES_REF: 'li.Properties',
        EXTENSIONS_REF: 'li.Extensions',
        ITEMS_REF: 'li.Items'
    });


    /*
    Schema Pair View renders:
    <li>key:{value} <span class="AttributeDelimiter">,</span></li>
    Key is optional, for example when rendering an array of schemas.
    Schema Pair View is the very first class to be instantiated (for 
    the root JSON object).
    */
    SchemaPairV = Backbone.View.extend({
        tagName: 'div',
        className: 'SchemaPairView',
        datalevel: 0,
        menuCache: undefined,
        optionsCache: undefined,

        initialize: function() {
            _.bindAll(this, 'handleRemove');
            _.bindAll(this, 'handleToggleOptions');
            _.bindAll(this, 'handleMouseover');
            _.bindAll(this, 'handleMouseout');
            _.bindAll(this, 'handleBeingLast');
            _.bindAll(this, 'handleAddItem');
            _.bindAll(this, 'handleSchemaSaved');
            _.bindAll(this, 'handleExpandCollapse');
            // Notified of Options save from Options View.
            this.model.get('schema').bind('saved:Schema', this.handleSchemaSaved);
        },

        setLevel: function(aLevel) {
            this.datalevel = aLevel;
        },

        events: {
            'click span.Remove': 'handleRemove',
            'click span.AddProperty': 'handleAddProperty',
            'click span.AddItem': 'handleAddItem',
            'click span.AddExtension': 'handleAddExtension',
            'click span.Collapse': 'handleExpandCollapse',
            'click span.Expand': 'handleExpandCollapse',
            'click': 'handleToggleOptions',
            'mouseover': 'handleMouseover',
            'mouseout': 'handleMouseout'
        },

        /*
        Remove Options form, hide Options element and reset SPV colours.
        */
        handleSchemaSaved: function() {
            var r = $(SchemaPairV.OPTIONS_REF, this.el).filter(':first');
            r.empty().hide();
            $(this.el).toggleClass('SchemaPairViewEdit', false);
            $(this.el).toggleClass('SchemaPairViewHover', false);

            var updatedKey = this.model.get('key');

            // Items don't have keys.
            if (updatedKey != undefined) {
                // Use text() because we need to replace an existing value.
                $(SchemaPairV.KEY_REF, this.el).filter(':first').text('"' + this.model.get('key') + '":');
            }
            $(SchemaPairV.MENU_REF, this.el).filter(':first').css('visibility', 'hidden');
        },

        /*
        This could be improved (DOM not backed by native implementation), but it works.
        Find the last Schema Pair Delimiter that is a direct child of this Schema Pair 
        View and hide it.
        */
        handleBeingLast: function() {
            $('> span.SchemaPairDelimiter', this.el).filter(':last').hide();
        },

        handleExpandCollapse: function(e) {
            e.stopImmediatePropagation();
            $('div.Schema', this.el).filter(':first').toggle();
            $('span.Collapse', this.el).filter(':first').toggle();
            $('span.Expand', this.el).filter(':first').toggle();
        },

        /*
        Removing a Schema Pair starts with Collection containing the Schema Pair, 
        then notifies the parent Schema to make any UI changes.
        SPV -> SLV -> S
        */
        handleRemove: function(e) {
            e.stopImmediatePropagation();

            $(this.el).remove();
            this.model.set({
                removed: true
            });
            this.model.unbind('saved:Schema');
            this.model.trigger('deleted:SchemaPairV');
        },

        handleAddExtension: function(e) {
            e.stopImmediatePropagation();
            this.model.get('schema').trigger('add:Extension');
        },

        /*
        A Schema Pair is added to a Collection belonging to a Schema Pair.
        But the Collection may not exist.
        Therefore, adding a Schema Pair starts with Schema, then notifies  
        the possibly newly created Collection.
        SPV -> S -> (child) SPLV
        */
        handleAddProperty: function(e) {
            e.stopImmediatePropagation();
            this.model.get('schema').trigger('add:Property');
        },

        /*
        A Schema Pair is added to a Collection belonging to a Schema Pair.
        But the Collection may not exist.
        Therefore, adding a Schema Pair starts with Schema, then notifies  
        the possibly newly created Collection.
        SPV -> S -> (child) SPLV
        */
        handleAddItem: function(e) {
            e.stopImmediatePropagation();
            this.model.get('schema').trigger('add:Item');
        },

        handleToggleOptions: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            var r = $(SchemaPairV.OPTIONS_REF, this.el).filter(':first');
            $(this.el).toggleClass('SchemaPairViewEdit');
            //$(this.el).toggleClass('SchemaPairViewHover');
            if (r.is(':visible')) {
                r.empty().hide();
            } else {
                // Pass in this.model so Key can be edited too.
                var sov = new OptionsV({
                    model: this.model
                });
                r.append(sov.render().el).show();
            }
        },

        handleMouseover: function(e) {
            e.stopImmediatePropagation();
            this.checkCache();

            // Show the menu: +pty, +itm, rm-r.
            this.menuCache.css('visibility', 'visible');
            $(this.el).toggleClass('SchemaPairViewHover', true);
        },

        checkCache: function() {
            if (!this.menuCache) {
                this.menuCache = $(SchemaPairV.MENU_REF, this.el).filter(':first');
            }

            if (!this.optionsCache) {
                this.optionsCache = $(SchemaPairV.OPTIONS_REF, this.el).filter(':first');
            }
        },

        handleMouseout: function(e) {
            e.stopImmediatePropagation();
            this.checkCache();

            // Hide the menu: +pty, +itm, rm-r.
            this.menuCache.css('visibility', 'hidden');
            $(this.el).toggleClass('SchemaPairViewHover', false);
        },

        render: function() {
            if (!this.model) {
                return;
            }

            var root = this.model.get('root');
            var v = {
                Key: this.model.get('key'),
                DataLevel: this.datalevel,
            };

            var load = !Templates['schemapair'];
            if (load) {
                Templates['schemapair'] = $(SchemaPairV.TEMPLATE).html();
            }
            var t = _.template(Templates['schemapair'], v);

            $(this.el).attr("data-level", this.datalevel);
            $(this.el).append(t);

            if (root) {
                $(SchemaPairV.MENU_CLOSE_REF, this.el).hide();
                $(SchemaPairV.DELIMITER_REF, this.el).remove();
            }

            // Schemas in arrays don't have keys.
            if (v.Key) {
                $(SchemaPairV.KEY_REF, this.el).show();
            }

            var sv = new SchemaV({
                model: this.model.get('schema')
            });
            sv.setLevel(this.datalevel);

            $(SchemaPairV.SCHEMA_REF, this.el).append(sv.render().el);
            return this;
        }
    }, {
        TEMPLATE: '#SchemaPairView-Template',
        KEY_REF: 'div.Key',
        SCHEMA_REF: 'div.Schema',
        MENU_REF: 'div.Menu',
        MENU_CLOSE_REF: 'div.Menu span.Remove',
        OPTIONS_REF: 'div.Options',
        DELIMITER_REF: 'span.SchemaPairDelimiter'
    });


    /*
    Schema Pair List View renders a list of Schema Pairs:
    <li>key:{value},</li>
    A key is optional, for example when rendering an array of schemas.
    */
    SchemaPairLV = Backbone.View.extend({
        tagName: 'li',
        datalevel: 0,

        initialize: function() {
            _.bindAll(this, 'render');
            _.bindAll(this, 'removeSchemaPair');
            _.bindAll(this, 'handleAddSchemaPair');
            // Request from Schema to add a new Schema Pair to Items or Properties.
            this.collection.bind('add:SchemaPair', this.handleAddSchemaPair);
        },

        setLevel: function(aLevel) {
            this.datalevel = aLevel;
        },

        /*
        A Schema Pair is added to a Collection belonging to a Schema Pair.
        But the Collection may not exist.
        Therefore, adding a property or item starts with Schema Pair, which   
        then assigns the real work to the possibly newly created Collection.
        SP -> S -> (child) SPL
        */
        handleAddSchemaPair: function() {
            var key = undefined;
            var pSchemas = (this.className == 'Properties');
            var iSchemas = (this.className == 'Items');
            var eSchemas = (this.className == 'Extensions');
            var nestedLevel = (this.datalevel + 1);
            var first = (this.collection.length == 0);
            var second = (this.collection.length == 1);
            var tupleTyping = (second && (iSchemas || eSchemas));
            /* Schema Pair can contain nested Schema Pairs, therefore
            need to use :first. */
            var r = $(SchemaPairLV.SCHEMAS_REF, this.el).filter(':first');

            r.attr("data-level", nestedLevel);

            // Only properties have keys.
            if (pSchemas) {
                key = "RenameMe";
            }

            var sp = new SchemaPair({
                key: key,
                schema: new Schema()
            });
            this.collection.add(sp);

            if (!first) {
                // Show the previous schema delimiter.
                $(SchemaPairLV.SCHEMA_DELIMITER_REF, this.el).filter(':last').show();
            }

            spv = new SchemaPairV({
                model: sp
            });
            spv.setLevel(nestedLevel);

            r.append(spv.render().el);
            spv.handleBeingLast();

            if (tupleTyping) {
                $(SchemaPairLV.OPENING_SYMBOL_REF, this.el).filter(':first').append("[").show();
                $(SchemaPairLV.CLOSING_SYMBOL_REF, this.el).filter(':last').append("]").show();
            }
            sp.bind('deleted:SchemaPairV', this.removeSchemaPair);
        },

        /*
        A Schema Pair is removed from a Collection belonging to a Schema Pair.
        Therefore, removing a Schema Pair starts with Collection, then notifies Schema Pair
        containing the Collection.
        SP -> SL -> (parent) S
        */
        removeSchemaPair: function() {
            var self = this;
            var iSchemas = (this.className == 'Items');
            var eSchemas = (this.className == 'Extensions');
            // SPV should have flagged SP for removal.
            var removed = (this.collection).filterByRemoved();

            _(removed).each(function(sp) {
                self.collection.remove(sp);
            });

            var empty = (this.collection.length <= 0);
            var oneSchema = (this.collection.length == 1);

            if (empty) {
                /* There is no need for this SPLV anymore.
                But remember to unbind from events! */
                this.collection.unbind('add:SchemaPair');
                $(this.el).remove();
            } else {

                if (oneSchema && (iSchemas || eSchemas)) {
                    // No need for Tuple Typing syntax any more.
                    $(SchemaPairLV.OPENING_SYMBOL_REF, this.el).filter(':first').empty();
                    $(SchemaPairLV.CLOSING_SYMBOL_REF, this.el).filter(':last').empty();
                }

                var selector = 'div.SchemaPairView[data-level="' + (this.datalevel + 1) + '"]';
                var lastSchemaPair = $(selector, this.el).filter(':last');
                $(SchemaPairLV.SCHEMA_DELIMITER_REF, lastSchemaPair).filter(':last').hide();
            }

            this.collection.trigger('removed:SchemaPair');
        },

        render: function() {
            var self = this;
            var v = {
                DataLevel: this.datalevel,
            };
            var pSchemas = (this.className == 'Properties');
            var iSchemas = (this.className == 'Items');
            var eSchemas = (this.className == 'Extensions');
            var tupleTyping = ((iSchemas || eSchemas) && (this.collection.length > 1));
            var t;

            var load = !Templates['properties'];
            if (load) {
                Templates['properties'] = $(SchemaPairLV.PROPERTIES_TEMPLATE).html();
            }

            load = !Templates['items'];
            if (load) {
                Templates['items'] = $(SchemaPairLV.ITEMS_TEMPLATE).html();
            }

            load = !Templates['extensions'];
            if (load) {
                Templates['extensions'] = $(SchemaPairLV.EXTENSIONS_TEMPLATE).html();
            }

            $(this.el).attr("data-level", this.datalevel);

            if (pSchemas) {
                t = _.template(Templates['properties'], v);
                $(this.el).append(t);
            } else if (iSchemas) {
                t = _.template(Templates['items'], v);
                $(this.el).append(t);
            } else if (eSchemas) {
                t = _.template(Templates['extensions'], v);
                $(this.el).append(t);
            }

            if (tupleTyping) {
                $(SchemaPairLV.OPENING_SYMBOL_REF, this.el).append("[");
            }

            var nestedLevel = (this.datalevel + 1);
            var r = $(SchemaPairLV.SCHEMAS_REF, this.el);
            r.attr("data-level", nestedLevel);


            _(this.collection.models).each(function(sp) {
                var index = this.collection.indexOf(sp);
                var isLast = (index == (this.collection.length - 1));

                var spv = new SchemaPairV({
                    model: sp
                });
                spv.setLevel(nestedLevel);

                r.append(spv.render().el);
                sp.bind('deleted:SchemaPairV', this.removeSchemaPair);

                if (isLast) {
                    spv.handleBeingLast();
                }
            }, this);

            if (tupleTyping) {
                $(SchemaPairLV.CLOSING_SYMBOL_REF, this.el).filter(':last').append("]");
            }

            $(this.el).show();
            return this;
        }
    }, {
        PROPERTIES_TEMPLATE: '#SchemaPairListViewProperties-Template',
        EXTENSIONS_TEMPLATE: '#SchemaPairListViewExtensions-Template',
        ITEMS_TEMPLATE: '#SchemaPairListViewItems-Template',
        OPENING_SYMBOL_REF: 'span.OpeningSymbol',
        CLOSING_SYMBOL_REF: 'span.ClosingSymbol',
        SCHEMAS_REF: 'div.Schemas',
        SCHEMA_DELIMITER_REF: 'span.SchemaPairDelimiter',
    });


    /*
    Type List View renders a single type and a types array (union types):
    <li>type:"string"</li>
    <li>type:["string", "object", "number"],</li>
    Although this View renders the Collection of Types and not Types themselves 
    (Types have their own model), they're so basic we just extract the value 
    from the Type model and do everything inside the loop.
    */
    TypeLV = Backbone.View.extend({
        tagName: 'li',
        className: 'Types',
        datalevel: 0,

        setLevel: function(aLevel) {
            this.datalevel = aLevel;
        },

        render: function() {
            var self = this;
            var unionType = (this.collection.length > 1);
            var v = {
                DataLevel: this.datalevel
            }

            var load = !Templates['types'];
            if (load) {
                Templates['types'] = $(TypeLV.TEMPLATE).html();
            }
            var t = _.template(Templates['types'], v);

            $(this.el).empty();
            $(this.el).attr('data-level', this.datalevel);
            $(this.el).append(t);

            if (unionType) {
                $(TypeLV.OPENING_SYMBOL_REF, this.el).append(TypeLV.UNION_OPENING_SYMBOL);
            }

            var r = $(TypeLV.TYPE_REF, this.el);

            _(this.collection.models).each(function(type) {
                var index = this.collection.indexOf(type);
                var isLast = (index == (this.collection.length - 1));

                r.append('"' + type.get('t') + '"');
                if (!isLast) {
                    r.append(',');
                }
            }, this);

            if (unionType) {
                $(TypeLV.CLOSING_SYMBOL_REF, this.el).append(TypeLV.UNION_CLOSING_SYMBOL);
            }
            $(this.el).show();
            return this;
        }
    }, {
        TEMPLATE: '#TypeListView-Template',
        OPENING_SYMBOL_REF: 'span.OpeningSymbol',
        CLOSING_SYMBOL_REF: 'span.ClosingSymbol',
        UNION_OPENING_SYMBOL: '[',
        UNION_CLOSING_SYMBOL: ']',
        TYPE_REF: 'span.T'
    });

});
