# be-for [WIP]

Create inline formula evaluation from  HTML signals via local script tags.

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

Add more context to the scripting

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({isHappy, isWealthy, liberated}) => {
            console.log({isHappy, isWealthy, liberated});
            return {
                value: isHappy && !isWealthy && liberated.length > 17
            };
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

## Example 2a [TODO]

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