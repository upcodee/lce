"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onEachStoreSetTo = exports.onEachSetTo = exports.MergeLce = exports.mutableLce = void 0;
var mobx_1 = require("mobx");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
function mutableLce(loading, content, error) {
    if (loading === void 0) { loading = false; }
    if (content === void 0) { content = undefined; }
    if (error === void 0) { error = undefined; }
    return {
        loading: loading,
        error: error,
        content: content
    };
}
exports.mutableLce = mutableLce;
var MergeLce = /** @class */ (function () {
    function MergeLce() {
        var lces = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lces[_i] = arguments[_i];
        }
        this.lces = lces;
    }
    Object.defineProperty(MergeLce.prototype, "error", {
        get: function () {
            var firstLce = this.getFirstLce();
            return firstLce && firstLce.error;
        },
        enumerable: false,
        configurable: true
    });
    MergeLce.prototype.clearFirstError = function () {
        var firstLce = this.getFirstLce();
        mobx_1.action("clearFirstErrorAction", function () {
            firstLce.error = undefined;
        })();
    };
    MergeLce.prototype.getFirstLce = function () {
        return this.lces.filter(function (it) { return it.error != undefined; })[0];
    };
    Object.defineProperty(MergeLce.prototype, "loading", {
        get: function () {
            return this.lces.filter(function (it) { return it.loading; })[0] != undefined;
        },
        enumerable: false,
        configurable: true
    });
    return MergeLce;
}());
exports.MergeLce = MergeLce;
function onEachSetTo(lce, anyToError) {
    mobx_1.action("onEachSetToLoading", function () {
        lce.loading = true;
    })();
    return rxjs_1.pipe(operators_1.tap(mobx_1.action("onEachSetToContent", function (it) {
        lce.content = it;
        lce.loading = false;
    }), mobx_1.action("onEachSetToError", function (err) {
        lce.error = anyToError(err);
        lce.loading = false;
    })));
}
exports.onEachSetTo = onEachSetTo;
function onEachStoreSetTo(lce, loadingAfterCached, anyToError) {
    return operators_1.tap({
        next: function (it) {
            switch (it.type) {
                case "StoreResponseLoading":
                    mobx_1.action("subscribeLceLoading", function (it) {
                        lce.loading = true;
                    })(it);
                    break;
                case "StoreResponseError":
                    mobx_1.action("subscribeLceError", function (it) {
                        lce.error = anyToError(it.error);
                        lce.loading = false;
                    })(it);
                    break;
                case "StoreResponseData":
                    mobx_1.action("subscribeLceContent", function (it) {
                        lce.content = it.value;
                        lce.loading = loadingAfterCached && it.origin != "Fetcher";
                    })(it);
                    break;
            }
        }
    });
}
exports.onEachStoreSetTo = onEachStoreSetTo;
