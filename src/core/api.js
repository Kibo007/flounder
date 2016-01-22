
import classes          from './classes';

const api = {

    /**
     * ## buildFromUrl
     *
     * uses loadDataFromUrl and completes the entire build with the new data
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return _Void_
     */
    buildFromUrl : function( url, callback )
    {
        this.loadDataFromUrl( url, data =>
        {
            this.data = data;

            if ( callback )
            {
                callback( this.data );
            }

            this.rebuild( this.data );
        } );
    },


    /**
     * ## clickByIndex
     *
     * programatically sets selected by index.  If there are not enough elements
     * to match the index, then nothing is selected. Fires the onClick event
     *
     * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    clickByIndex : function( index, multiple )
    {
        return this.setByIndex( index, multiple, false );
    },


    /**
     * ## clickByText
     *
     * programatically sets selected by text string.  If the text string
     * is not matched to an element, nothing will be selected. Fires the onClick event
     *
     * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    clickByText : function( text, multiple )
    {
        return this.setByText( text, multiple, false );
    },


    /**
     * ## clickByValue
     *
     * programatically sets selected by value string.  If the value string
     * is not matched to an element, nothing will be selected. Fires the onClick event
     *
     * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    clickByValue : function( value, multiple )
    {
        return this.setByValue( value, multiple, false );
    },


    /**
     * ## destroy
     *
     * removes flounder and all it's events from the dom
     *
     * @return _Void_
     */
    destroy : function()
    {
        this.componentWillUnmount();

        let refs                = this.refs;
        let originalTarget      = this.originalTarget;
        let tagName             =  originalTarget.tagName;

        refs.flounder.flounder  = originalTarget.flounder = this.target.flounder = null;

        if ( tagName === 'INPUT' || tagName === 'SELECT' )
        {
            if ( tagName === 'SELECT' )
            {
                let firstOption = originalTarget[0];

                if ( firstOption && firstOption.textContent === this.props.placeholder )
                {
                    originalTarget.removeChild( firstOption );
                }
            }

            let target = originalTarget.nextElementSibling;
            try
            {
                target.parentNode.removeChild( target );
                originalTarget.tabIndex = 0;
                this.removeClass( originalTarget, classes.HIDDEN );
            }
            catch( e )
            {
                throw ' : this flounder may have already been removed';
            }
        }
        else
        {
            try
            {
                let wrapper = refs.wrapper;
                let parent  = wrapper.parentNode;
                parent.removeChild( wrapper );
            }
            catch( e )
            {
                throw ' : this flounder may have already been removed';
            }
        }
    },


    /**
     * ## deselectAll
     *
     * deslects all data
     *
     * @return _Void_
     */
    deselectAll : function()
    {
        this.removeSelectedClass();
        this.removeSelectedValue();
    },


    /**
     * ## disable
     *
     * disables flounder by adjusting listeners and classes
     *
     * @param {Boolean} bool dsable or enable
     *
     * @return _Void_
     */
    disable : function( bool )
    {
        let refs        = this.refs;
        let flounder    = refs.flounder;
        let selected    = refs.selected;

        if ( bool )
        {
            refs.flounder.removeEventListener( 'keydown', this.checkFlounderKeypress );
            refs.selected.removeEventListener( 'click', this.toggleList );
            this.addClass( selected, classes.DISABLED );
            this.addClass( flounder, classes.DISABLED );
        }
        else
        {
            refs.flounder.addEventListener( 'keydown', this.checkFlounderKeypress );
            refs.selected.addEventListener( 'click', this.toggleList );
            this.removeClass( selected, classes.DISABLED );
            this.removeClass( flounder, classes.DISABLED );
        }
    },


    /**
     * ## disableByIndex
     *
     * disables the options with the given index
     *
     * @param {Mixed} i index of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByIndex : function( index, reenable )
    {
        let refs = this.refs;

        if ( typeof index !== 'string' && index.length )
        {
            let disableByIndex = this.disableByIndex.bind( this );
            return index.map( _i => disableByIndex( _i, reenable ) );
        }
        else
        {
            let el  = refs.data[ index ];

            if ( el )
            {
                let opt = refs.selectOptions[ index ];

                if ( reenable )
                {
                    opt.disabled = false;
                    this.removeClass( el, 'flounder__disabled' );
                }
                else
                {
                    opt.disabled = true;
                    this.addClass( el, 'flounder__disabled' );
                }

                return [ el, opt ];
            }

            return null;
        }
    },


    /**
     * ## disableByText
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByText : function( text, reenable )
    {
        if ( typeof text !== 'string' && text.length )
        {
            let disableByText = this.disableByText.bind( this );
            return text.map( _t => disableByText( _t, reenable ) );
        }
        else
        {
            let res     = [];
            let getText = document.all ? 'innerText' : 'textContent'

            this.refs.selectOptions.forEach( function( el )
            {
                let _elText = el[ getText ];

                if ( _elText === text )
                {
                    res.push( el.index );
                }
            } );

            return res.length ? this.disableByIndex( res, reenable ) : null;
        }
    },


    /**
     * ## disableByValue
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByValue : function( value, reenable )
    {
        if ( typeof value !== 'string' && value.length )
        {
            let disableByValue = this.disableByValue.bind( this );
            return value.map( _v => disableByValue( _v, reenable ) );
        }
        else
        {
            value = this.refs.select.querySelector( '[value="' + value + '"]' );
            return value ? this.disableByIndex( value.index, reenable ) : null;
        }
    },


    /**
     * ## enableByIndex
     *
     * shortcut syntax to enable an index
     *
     * @param {Mixed} index index of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByIndex : function( index )
    {
        return this.disableByIndex( index, true );
    },


    /**
     * ## enableByText
     *
     * shortcut syntax to enable by text
     *
     * @param {Mixed} text text of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByText : function( text )
    {
        return this.disableByText( text, true );
    },


    /**
     * ## enableByValue
     *
     * shortcut syntax to enable a value
     *
     * @param {Mixed} value value of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByValue : function( value )
    {
        this.disableByValue( value, true );
    },


    /**
     * ## getData
     *
     * returns the option and div tags related to an option
     *
     * @param {Number} _i index to return
     *
     * @return _Object_ option and div tage
     */
    getData : function( _i )
    {
        let refs = this.refs;

        if ( typeof _i === 'number' )
        {
            return { option : refs.selectOptions[ _i ], div : refs.data[ _i ] };
        }
        else
        {
            return refs.selectOptions.map( ( el, i ) =>
            {
                return this.getData( i );
            } );
        }
    },


    /**
     * ## getSelected
     *
     * returns the currently selected data of a SELECT box
     *
     * @return _Void_
     */
    getSelected : function()
    {
        let _el         = this.refs.select;
        let opts        = [], opt;
        let _data       = _el.options;

        for ( let i = 0, len = _data.length; i < len; i++ )
        {
            opt = _data[ i ];

            if ( opt.selected )
            {
                opts.push( opt );
            }
        }

        return opts;
    },


    /**
     * ## getSelectedValues
     *
     * returns the values of the currently selected data
     *
     * @return _Void_
     */
    getSelectedValues : function()
    {
        return this.getSelected().map( ( _v ) => _v.value )
    },


    /**
     * ## loadDataFromUrl
     *
     * loads data from a passed url
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return _Void_
     */
    loadDataFromUrl : function( url, callback )
    {
        try
        {
            this.http.get( url ).then( data =>
            {
                if ( data )
                {
                    this.data = JSON.parse( data );
                    if ( callback )
                    {
                        callback( this.data );
                    }
                }
                else
                {
                    console.log( 'no data recieved' );
                }
            } ).catch( e => console.log( 'something happened: ', e ) );
        }
        catch ( e )
        {
            console.log( 'something happened.  check your loadDataFromUrl callback ', e );
        }

        return [ {
            text        : 'Loading...',
            value       : '',
            index       : 0,
            extraClass  : classes.HIDDEN
        } ];
    },


    /**
     * ## rebuild
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Array} data array with optino information
     *
     * @return _Object_ rebuilt flounder object
     */
    rebuild : function( data )
    {
        data            = data || this.data;
        let refs        = this.refs;
        let selected    = refs.select.selectedOptions;
        selected        = Array.prototype.slice.call( selected ).map( function( e ){ return e.value; } );

        this.removeOptionsListeners();

        refs.select.innerHTML       = '';
        refs.optionsList.innerHTML  = '';

        let _select                 = refs.select;
        refs.select                 = false;
        [ refs.data, refs.selectOptions ] = this.buildData( this._default, data, refs.optionsList, _select );
        refs.select                 = _select;

        this.removeSelectedValue();
        this.removeSelectedClass();

        refs.selectOptions.forEach( ( el, i ) =>
        {
            let valuePosition = selected.indexOf( el.value );

            if ( valuePosition !== -1 )
            {
                selected.splice( valuePosition, 1 );
                el.selected = true;
                this.addClass( refs.data[ i ], this.selectedClass );
            }
        } );

        this.addOptionsListeners();
        this.data = data;

        return this;
    },


    /**
     * ## reconfigure
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Object} props object containing config options
     *
     * @return _Object_ rebuilt flounder object
     */
    reconfigure : function( props )
    {
        props       = props || {};
        props.data  = props.data || this.data;

        return this.constructor( this.originalTarget, props );
    },


    /**
     * ## setByIndex
     *
     * programatically sets the value by index.  If there are not enough elements
     * to match the index, then nothing is selected.
     *
     * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    setByIndex : function( index, multiple, programmatic = true )
    {
        let refs = this.refs;

        if ( typeof index !== 'string' && index.length )
        {
            let setByIndex = this.setByIndex.bind( this );
            return index.map( _i => setByIndex( _i, multiple, programmatic ) );
        }
        else
        {
            let el = refs.data[ index ];

            if ( el )
            {
                let isOpen = this.hasClass( refs.wrapper, 'open' );
                this.toggleList( isOpen ? 'close' : 'open' );
                this.___forceMultiple       = multiple;
                this.___programmaticClick   = programmatic;
                el.click();

                return el;
            }

            return null;
        }
    },


    /**
     * ## setByText
     *
     * programatically sets the text by string.  If the text string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    setByText : function( text, multiple, programmatic = true )
    {
        if ( typeof text !== 'string' && text.length )
        {
            let setByText = this.setByText.bind( this );
            return text.map( _i => setByText( _i, multiple, programmatic ) );
        }
        else
        {
            let res     = [];
            let getText = document.all ? 'innerText' : 'textContent'

            this.refs.selectOptions.forEach( function( el )
            {
                let _elText = el[ getText ];

                if ( _elText === text )
                {
                    res.push( el.index );
                }
            } );

            return res.length ? this.setByIndex( res, multiple, programmatic ) : null;
        }
    },


    /**
     * ## setByValue
     *
     * programatically sets the value by string.  If the value string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    setByValue : function( value, multiple, programmatic = true )
    {
        if ( typeof value !== 'string' && value.length )
        {
            let setByValue = this.setByValue.bind( this );
            return value.map( _i => setByValue( _i, multiple, programmatic ) );
        }
        else
        {
            value = this.refs.select.querySelector( '[value="' + value + '"]' );
            return value ? this.setByIndex( value.index, multiple, programmatic ) : null;
        }
    }
};

export default api;

