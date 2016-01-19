
import classes          from './classes';
const nativeSlice = Array.prototype.slice;

const build = {

    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} el option leement to add description to
     * @param {String} text description
     *
     * @return _Void_
     */
    addOptionDescription : function( el, text )
    {
        let div         = document.createElement( 'div' );
        div.innerHTML   = text;
        div.className   = classes.DESCRIPTION;
        el.appendChild( div );
    },


    /**
     * ## addSearch
     *
     * checks if a search box is required and attaches it or not
     *
     * @param {Object} flounder main element reference
     *
     * @return _Mixed_ search node or false
     */
    addSearch : function( flounder )
    {
        if ( this.props.search )
        {
            let search = this.constructElement( {
                                    tagname     : 'input',
                                    type        : 'text',
                                    className   : classes.SEARCH
                                } );
            flounder.appendChild( search );

            return search;
        }

        return false;
    },


    /**
     * ## bindThis
     *
     * binds this to whatever functions need it.  Arrow functions cannot be used
     * here due to the react extension needing them as well;
     *
     * @return _Void_
     */
    bindThis : function()
    {
        this.addClass               = this.addClass.bind( this );
        this.attachAttributes       = this.attachAttributes.bind( this );
        this.catchBodyClick         = this.catchBodyClick.bind( this );
        this.checkClickTarget       = this.checkClickTarget.bind( this );
        this.checkFlounderKeypress  = this.checkFlounderKeypress.bind( this );
        this.checkPlaceholder       = this.checkPlaceholder.bind( this );
        this.clickSet               = this.clickSet.bind( this );
        this.divertTarget           = this.divertTarget.bind( this );
        this.displayMultipleTags    = this.displayMultipleTags.bind( this );
        this.fuzzySearch            = this.fuzzySearch.bind( this );
        this.removeMultiTag         = this.removeMultiTag.bind( this );
        this.firstTouchController   = this.firstTouchController.bind( this );
        this.setKeypress            = this.setKeypress.bind( this );
        this.setSelectValue         = this.setSelectValue.bind( this );
        this.toggleClass            = this.toggleClass.bind( this );
        this.toggleList             = this.toggleList.bind( this );
    },


    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom : function()
    {
        this.refs               = {};

        let constructElement    = this.constructElement;

        let wrapperClass        = classes.MAIN_WRAPPER;
        let wrapper             = this.constructElement( { className : this.wrapperClass ?
                                    wrapperClass + ' ' + this.wrapperClass : wrapperClass } );
        let flounderClass       = classes.MAIN;
        let flounder            = constructElement( { className : this.flounderClass ?
                                    flounderClass + '  ' + this.flounderClass : flounderClass } );

        flounder.setAttribute( 'aria-hidden', true );
        flounder.tabIndex       = 0;
        wrapper.appendChild( flounder );

        let select              = this.initSelectBox( wrapper );
        select.tabIndex         = -1;

        if ( this.multiple === true )
        {
            select.setAttribute( 'multiple', '' );
        }

        let data                = this.data;

        let defaultValue        = this._default = this.setDefaultOption( this.props, data );

        let selected            = constructElement( { className : classes.SELECTED_DISPLAYED,
                                        'data-value' : defaultValue.value, 'data-index' : defaultValue.index || -1 } );
            selected.innerHTML  = defaultValue.text;

        let multiTagWrapper     = this.props.multiple ? constructElement( { className : classes.MULTI_TAG_LIST } ) : null;

        let arrow               = constructElement( { className : classes.ARROW } );
        let optionsListWrapper  = constructElement( { className : classes.OPTIONS_WRAPPER + '  ' + classes.HIDDEN } );
        let optionsList         = constructElement( { className : classes.LIST } );
        optionsList.setAttribute( 'role', 'listbox' );
        optionsListWrapper.appendChild( optionsList );

        [ selected, multiTagWrapper, arrow, optionsListWrapper ].forEach( el =>
        {
            if ( el )
            {
                flounder.appendChild( el );
            }
        } );

        let search = this.addSearch( flounder );
        let selectOptions;
        [ data, selectOptions ] = this.buildData( defaultValue, data, optionsList, select );

        this.target.appendChild( wrapper );

        this.refs = { wrapper, flounder, selected, arrow, optionsListWrapper,
                    search, multiTagWrapper, optionsList, select, data, selectOptions };
    },


    /**
     * ## buildData
     *
     * builds both the div and select based options. will skip the select box
     * if it already exists
     *
     * @param {Mixed} defaultValue default entry (string or number)
     * @param {Array} data array with optino information
     * @param {Object} optionsList reference to the div option wrapper
     * @param {Object} select reference to the select box
     *
     * @return _Array_ refs to both container elements
     */
    buildData : function( defaultValue, originalData, optionsList, select )
    {
        originalData                = originalData || [];
        let index                   = 0;
        let data                    = [];
        let selectOptions           = [];
        let constructElement        = this.constructElement;
        let addOptionDescription    = this.addOptionDescription;
        let selectedClass           = this.selectedClass;
        let escapeHTML              = this.escapeHTML;
        let addClass                = this.addClass;
        let selectRef               = this.refs.select;


        /**
         * ## buildDiv
         *
         * builds an individual div tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        let buildDiv = function( dataObj, i )
        {
            if ( typeof dataObj !== 'object' )
            {
                dataObj = {
                    text    : dataObj,
                    value   : dataObj
                };
            }
            dataObj.index   = i;

            let extraClass  = i === defaultValue.index ? '  ' + selectedClass : '';

            let res = {
                className       : classes.OPTION + extraClass,
                'data-index'    : i
            };

            for ( let o in dataObj )
            {
                if ( o !== 'text' && o !== 'description' )
                {
                    res[ o ] = dataObj[ o ];
                }
            }

            let data        = constructElement( res );
            let escapedText = escapeHTML( dataObj.text );
            data.innerHTML  = escapedText;

            if ( dataObj.description )
            {
                addOptionDescription( data, dataObj.description );
            }

            data.className += dataObj.extraClass ? '  ' + dataObj.extraClass : '';
            data.setAttribute( 'role', 'option' );

            return data;
        };


        /**
         * ## buildOption
         *
         * builds an individual option tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        let buildOption = function( dataObj, i )
        {
            let selectOption;

            if ( !selectRef )
            {
                selectOption            = constructElement( { tagname : 'option',
                                            className   : classes.OPTION_TAG,
                                            value       : dataObj.value } );
                let escapedText         = escapeHTML( dataObj.text );
                selectOption.innerHTML  = escapedText;
                select.appendChild( selectOption );
            }
            else
            {
                let selectChild     = selectRef.children[ i ];
                selectOption        = selectChild;
                selectChild.setAttribute( 'value', selectChild.value );
                addClass( selectChild, 'flounder--option--tag' );
            }

            if ( i === defaultValue.index )
            {
                selectOption.selected = true;
            }

            if ( selectOption.getAttribute( 'disabled' ) )
            {
                addClass( data[ i ], classes.DISABLED_OPTION );
            }

            return selectOption;
        };


        originalData.forEach( ( dataObj ) =>
        {
            if ( dataObj.header )
            {
                let section = constructElement( { tagname   : 'div',
                                                className   : classes.SECTION } );
                let header = constructElement( { tagname    : 'div',
                                                className   : classes.HEADER } );
                header.textContent = dataObj.header;
                section.appendChild( header );
                optionsList.appendChild( section );

                dataObj.data.forEach( ( d ) =>
                {
                    data[ index ]           = buildDiv( d, index );
                    section.appendChild( data[ index ] );
                    selectOptions[ index ]  = buildOption( d, index );
                    index++;
                } );
            }
            else
            {
                data[ index ]           = buildDiv( dataObj, index );
                optionsList.appendChild( data[ index ] );
                selectOptions[ index ]  = buildOption( dataObj, index );
                index++;
            }
        } );

        return  [ data, selectOptions ];
    },


    /**
     * ## initSelectBox
     *
     * builds the initial select box.  if the given wrapper element is a select
     * box, this instead scrapes that, thus allowing php fed elements
     *
     * @param {DOMElement} wrapper main wrapper element
     *
     * @return _DOMElement_ select box
     */
    initSelectBox : function( wrapper )
    {
        let target = this.target;
        let select;

        if ( target.tagName === 'SELECT' )
        {
            this.addClass( target, classes.SELECT_TAG );
            this.addClass( target, classes.HIDDEN );
            this.refs.select    = target;

            let data = [], selectOptions = [];

            nativeSlice.apply( target.children ).forEach( function( optionEl )
            {
                selectOptions.push( optionEl );
                data.push( {
                    text    : optionEl.innerHTML,
                    value   : optionEl.value
                } );
            } );

            this.data               = data;
            this.target             = target.parentNode;
            this.refs.selectOptions = selectOptions;

            select = this.refs.select;
            this.addClass( select, classes.HIDDEN );
        }
        else
        {
            select = this.constructElement( { tagname : 'select', className : classes.SELECT_TAG + '  ' + classes.HIDDEN } );
            wrapper.appendChild( select );
        }

        return select;
    },


    /**
     * ## Set Target
     *
     * sets the target related
     *
     * @param {DOMElement} target  the actual to-be-flounderized element
     *
     * @return _Void_
     */
    setTarget : function( target )
    {
        target      = target.nodeType === 1 ? target : document.querySelector( target );

        this.originalTarget = target;
        target.flounder     = this;

        if ( target.tagName === 'INPUT' )
        {
            this.addClass( target, classes.HIDDEN );
            target.setAttribute( 'aria-hidden', true );
            target.tabIndex = -1;
            target          = target.parentNode;
        }

        this.target = target;
    }
};

export default build;
