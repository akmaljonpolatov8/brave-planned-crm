"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(error, _req, res, _next) {
    console.error(error);
    return res.status(500).json({ message: "Serverda kutilmagan xatolik yuz berdi" });
}
