# be-for [TODO]

Create computed microdata property HTML signals with script tags.

The output element supports an interesting use of the "for" attribute, which [be-calculating](https://github.com/bahrus/be-calculating) builds on.  However, be-calculating is somewhat tied to the output element

*be-for* builds on similar ideas, but focuses applying similar ideas based on microdata, and also supports name attributes.

## Example 1 [TODO]

```html
<link itemprop=isHappy>
<link itemprop=isWealthy>

...

<script nomodule>
    isHappy && !isWealthy
</script>
<link itemprop=isInNirvana be-for='Values based on $isHappy, $isWealthy.'>
```

