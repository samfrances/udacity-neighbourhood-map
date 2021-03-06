# udacity-neighbourhood-map
My submission for the Neighbourhood Map project of the Udacity Front-End Web Developer Nanodegree

## How to run

To run the code on a local server, go to the root directory of the repository and run:

```
python -m SimpleHTTPServer
```
Then open your browser at [http://localhost:8000/](http://localhost:8000/).

## Libraries used

- Knockout 3.4.0
- JQuery 3.1.1

## APIs used

- Google Maps API
- Wikipedia API

## Third-party code

1. I used this page from the Udacity Google Maps APIs course as my starting point for project:
    + [https://github.com/udacity/ud864/blob/master/Project_Code_1_TheJavaScriptAPIOverview.html](https://github.com/udacity/ud864/blob/master/Project_Code_1_TheJavaScriptAPIOverview.html)
2. In creating a flexible layout relating to the header, whereby the header takes up a fixed height and the map expands to fill the rest, I made use of the technique recommended in the following Stackoverflow answer:
    + [http://stackoverflow.com/a/15377178](http://stackoverflow.com/a/15377178)
3. This Stackoverflow answer helped with link icon styling for the hamburger icon:
    + http://stackoverflow.com/questions/11013283/change-image-on-link-button-with-css
4. The following Udacity github repository provided some guidance on creating the slide-out menu:
    + [https://github.com/udacity/frontend-nanodegree-feedreader](https://github.com/udacity/frontend-nanodegree-feedreader)
5. My use of ko.utils.arrayFilter is based on that described in the article that follows, as is my binding for the search box:
    + [http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html](http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html)
6. This Stackoverflow answer helped with detecting the escape key:
    + [http://stackoverflow.com/a/3369624](http://stackoverflow.com/a/3369624)
7. Basic InfoWindow functionality took the following Udacity code, especially lines 115 to 129, as its starting point:
    + [https://github.com/udacity/ud864/blob/master/Project_Code_4_WindowShoppingPart2.html](https://github.com/udacity/ud864/blob/master/Project_Code_4_WindowShoppingPart2.html)
8. This Stackoverflow anwer provided some guidance in constructing my Wikipedia API query:
    + [http://stackoverflow.com/questions/8555320/is-there-a-clean-wikipedia-api-just-for-retrieve-content-summary](http://stackoverflow.com/questions/8555320/is-there-a-clean-wikipedia-api-just-for-retrieve-content-summary)
9. Colours for .error class borrowed from Bootstrap:
    + [http://getbootstrap.com/components/](http://getbootstrap.com/components/)

## Other third-party resources

- Hamburger icon from icomoon free pack, with small modification (colour inversion):
    + [https://github.com/Keyamoon/IcoMoon-Free/blob/master/PNG/32px/190-menu.png](https://github.com/Keyamoon/IcoMoon-Free/blob/master/PNG/32px/190-menu.png)