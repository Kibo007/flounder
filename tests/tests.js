
/* jshint globalstrict: true */
'use strict';

import Flounder from '../src/core/flounder.jsx';
import utils    from '../src/core/utils';

import constructorTest  from './unit/constructorTest';
import flounderTest     from './unit/flounderTest';


const nativeSlice = Array.prototype.slice;

class Tests
{
    constructor()
    {
        window.Flounder = Flounder;

        return this;
    }
};


utils.extendClass( Tests, utils );
let tests = new Tests;

constructorTest( Flounder );
flounderTest( Flounder );

export default tests;