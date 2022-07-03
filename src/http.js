const axios = require("axios");
const url = require("url");
const Image = require("./image");
const { Readable } = require("stream");

class HttpAdapter {
	constructor() {
		this.image = new Image();
	}

	/**
	 * Оптимизоровать изображение:
	 * - изменить размер
	 * - привести к типу
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async optimise(req, res) {
		try {
			const _url = url.parse(req.url);
			const { result: resultQuery, status: statusQuery, message: queryMessage } = HttpAdapter.getQuery(_url.query || "");
			if (statusQuery !== "success") {
				res.statusCode = 500;
				res.setHeader("Content-Type", "text/plain");
				res.end(String(queryMessage));
				return;
			}

			if (!resultQuery.src || (!resultQuery.h && !resultQuery.w)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "text/plain");
				res.end("not valid query");
				return;
			}

			const { result: resultImage, status: statusImage, message: imageMessage } = await HttpAdapter.getImage(resultQuery.src);
			if (statusImage !== "success") {
				res.statusCode = 500;
				res.setHeader("Content-Type", "text/plain");
				res.end(String(imageMessage));
				return;
			}

			const {
				result: resultResize,
				status: statusResize,
				message: resizeMessage,
			} = await this.image.resize(resultImage.data, Number(resultQuery.h), Number(resultQuery.w), resultQuery.f);
			if (statusResize !== "success") {
				res.statusCode = 500;
				res.setHeader("Content-Type", "text/plain");
				res.end(String(resizeMessage));
				return;
			}

			const { result: resultConvert, status: statusConvert, message: convertMessage } = await this.image.convert(resultResize, resultQuery.t);
			if (statusConvert !== "success") {
				res.statusCode = 500;
				res.setHeader("Content-Type", "text/plain");
				res.end(String(convertMessage));
				return;
			}

			res.statusCode = 200;

			switch (resultQuery.t) {
				case "webp":
					res.setHeader("Content-Type", "image/webp");
					break;
				case "avif":
					res.setHeader("Content-Type", "image/avif");
					break;
				case "png":
					res.setHeader("Content-Type", "image/png");
					break;

				default:
					res.setHeader("Content-Type", "image/jpeg");
					break;
			}

			const stream = new Readable();
			stream.push(resultConvert);
			stream.push(null);
			stream.pipe(res);
		} catch (error) {
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain");
			res.end(String(error));
		}
	}

	/**
	 * Получить объект Query
	 * @param {*} arg
	 * @returns
	 */
	static getQuery(arg = "") {
		try {
			let result = {};
			for (const element of arg.split("&")) {
				const key = element.split("=")[0];
				const value = element.split("=")[1];
				result[key] = value;
			}
			return {
				result,
				status: "success",
				message: "",
			};
		} catch (error) {
			console.error(error);
			return {
				result: null,
				status: "error",
				message: error,
			};
		}
	}

	/**
	 * Загрузить картинку
	 * @param {*} arg
	 * @returns
	 */
	static async getImage(arg = "") {
		try {
			const response = await axios.get(encodeURI(arg), {
				responseType: "arraybuffer",
			});
			return {
				result: response,
				status: "success",
				message: "",
			};
		} catch (error) {
			return {
				result: null,
				status: "error",
				message: error,
			};
		}
	}
}

module.exports = HttpAdapter;
