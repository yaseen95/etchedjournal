package com.etchedjournal.etched.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class RedirectController {
    @RequestMapping("/**/{[path:[^\\.]*}")
    fun redirect(): String {
        // When a user refreshes https://etchedjournal.com/journals
        // It makes a request to the backend for /journals. We don't handle that route on the
        // backend so we just forward it to the home page. And the route is handled on the frontend.

        // Forward to home page so that route is preserved.
        // https://stackoverflow.com/a/43921334
        return "forward:/"
    }
}
