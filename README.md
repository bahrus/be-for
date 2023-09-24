# be-for [TODO]

Create inline computed microdata property HTML signals with script tags.

The output element supports an interesting use of the "for" attribute, which [be-calculating](https://github.com/bahrus/be-calculating) builds on.  However, be-calculating is somewhat tied to the output element

*be-for* builds on similar ideas, but focuses applying similar ideas based on microdata, and also supports name attributes.

## Example 1a [TODO]

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

Values coming from host ($$)

```html
<my-custom-element>
    <script nomodule>
</my-custom-element>
```

