const sharp = require("sharp");

class ImageOptimizator {
	/**
	 * Изменить размеры изображения
	 * @param {*} buffer
	 * @param {*} height
	 * @param {*} width
	 * @param {*} fit
	 * @returns
	 */
	async resize(buffer, height, width, fit) {
		try {
			const resizeSharpImage = await sharp(buffer)
				.resize({
					height: height || undefined,
					width: width || undefined,
					fit: fit === "cover" ? sharp.fit.cover : sharp.fit.contain,
					background: "rgba(0, 0, 0, 0)",
				})
				.toBuffer();
			return {
				result: resizeSharpImage,
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
	 * Конвертировать изображение в нужный формат
	 * @param {*} buffer
	 * @param {*} type
	 * @returns
	 */
	async convert(buffer, type = "") {
		try {
			let result;
			switch (type) {
				case "webp":
					result = await sharp(buffer).webp({ quality: 90 }).toBuffer();
					break;
				case "avif":
					result = await sharp(buffer).avif({ quality: 90 }).toBuffer();
					break;
				case "png":
					result = await sharp(buffer).png().toBuffer();
					break;

				default:
					result = await sharp(buffer).jpeg().toBuffer();
					break;
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
}

module.exports = ImageOptimizator;
