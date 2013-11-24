
# SYNOPSIS
A through stream that caches

# MOTIVATION
There are some cases where the same data is piped over and over again.
In these cases there is no reason to repeat the transformation of the
data when the result can be retrieved from a cache.

# USAGE
Create a cache and pipe to its `cache` method.

```js
//
// create a new cache
//
var tc = require('through-cache')()

a.pipe(tc.cache(function(obj) {
	
	//
	// this only gets called once because
	// the exact same data is written again.
	//
	// but two writes are made to the `b` stream,
	// one from the `a` stream and one from the 
	// cache.
	//

	var str = '<div>' + obj.value + '</div>'
	this.push(str)

}).pipe(b)

stream.write({ value: 'hello, world' })
stream.write({ value: 'hello, world' })
```

To cache a function that will get applied to the data.

```js
a.pipe(tc.cache(function(obj) {

	this.transform(function(data) {
		return '<div>' + data + '</div>'
	})
	
	this.push(str)

}).pipe(b)
```

And to invalidate the cache.

```
tc.invalidate()
```
