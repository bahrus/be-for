# be-for [WIP]

Create inline computed microdata property HTML signals with script tags.

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

## From be-linked [TODO]

```html
<div itemscope>
    <link itemprop=isHappy>
    <link itemprop=isWealthy>

    ...

    <script nomodule>
        isHappy && !isWealthy
    </script>
    <link itemprop=isInNirvana be-linked='Compute value based on $isHappy, $isWealthy.'>
</div>
```

## Example 1b [TODO]

```html
<div itemscope>
    <form>
        <link itemprop=isHappy>
        <input name=isWealthy>
        <div contenteditable id=liberated></div>
        ...

        <script nomodule>
            isHappy && !isWealthy && liberated.length > 17;
        </script>
        <link itemprop=isInNirvana be-for='Value based on $isHappy, @isWealthy, #liberated.'>
    </form>
</div>
```

## Example 1c [TODO]

Values coming from host (/)

```html
<my-custom-element>
    #shadow
        <script nomodule>
            myProp ^ 2
        </script>
        <data itemprop=squared be-for='Value based on /myProp.'>
        <be-hive></be-hive>
</my-custom-element>
```

## Example 2a [TODO]

