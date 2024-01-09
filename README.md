# be-for

<!-- [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/be-switched) -->
[![Playwright Tests](https://github.com/bahrus/be-for/actions/workflows/CI.yml/badge.svg)](https://github.com/bahrus/be-for/actions/workflows/CI.yml) 
[![NPM version](https://badge.fury.io/js/be-for.png)](http://badge.fury.io/js/be-for)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-for?style=for-the-badge)](https://bundlephobia.com/result?p=be-for)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-for?compression=gzip">

see be-computed, replaces this.

Perform inline formula evaluation from  HTML signals via local script tags.

The *output* element supports an interesting use of the "for" attribute, which [be-calculating](https://github.com/bahrus/be-calculating) builds on.  However, be-calculating is somewhat tied to the output element.

*be-for* builds on similar ideas, but focuses its enhancements on microdata-based elements, and also supports name attributes.

Maybe this should derive from be-linked

## Example 1a

```html
<div itemscope>
    <link itemprop=isHappy>
    <link itemprop=isWealthy>

    ...

    <script nomodule>
        isHappy && !isWealthy
    </script>
    <link itemprop=isInNirvana be-for='Value based on $isHappy, $isWealthy.'>
</div>
```


## Example 1b

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        isHappy && !isWealthy && liberated.length > 17
    </script>
    <link itemprop=isInNirvana be-for='Value based on $isHappy, @isWealthy, #liberated.'>
</form>
```

## Example 1c

Add more context to the scripting, support side effects.

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({isHappy, isWealthy, liberated}) => {
            console.log({isHappy, isWealthy, liberated});
            return isHappy && !isWealthy && liberated.length > 17;
        }
    </script>
    <link itemprop=isInNirvana be-for='Value based on $isHappy, @isWealthy, #liberated.'>
</form>
```

## Example 1d

Values coming from host (/)

```html
<my-custom-element>
    #shadow
        <script nomodule>
            myProp ** 2
        </script>
        <data itemprop=squared be-for='Value based on /myProp.'>
        <be-hive></be-hive>
</my-custom-element>
```

## Example 2a

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({
            prop1: isHappy && !isWealthy && liberated.length > 17,
            prop2: liberated.blink(),
        })
    </script>
    <any-element itemprop=isInNirvana be-for='Action triggered by $isHappy, @isWealthy, #liberated.'></any-element>
</form>
```

## Viewing Your Element Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import 'be-for/be-for.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-for';
</script>
```