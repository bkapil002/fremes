import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Compressor from "compressorjs";
import { X, Plus } from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length + images.length > 1) {
      alert("Maximum 1 image allowed");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const compressImages = (images) => {
    return Promise.all(
      images.map(
        (image) =>
          new Promise((resolve, reject) => {
            new Compressor(image, {
              quality: 0.6,
              success(result) {
                resolve({
                  url: URL.createObjectURL(result),
                  file: result,
                });
              },
              error(err) {
                reject(err);
              },
            });
          })
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const compressedImages = await compressImages(images);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);

      compressedImages.forEach((image) => {
        formData.append("images", image.file);
      });

      const response = await fetch(`https://samzraa.onrender.com/api/users/signUp`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to register");
      }

      const data = await response.json();
      if (data.success || response.ok) {
        alert("Sign up successful!");
        navigate("/signin");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      alert(error.message || "An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Create Account 
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Sign up to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div className="flex justify-center">
            {imagePreviews.length > 0 ? (
              imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 shadow-md"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition-colors shadow-sm">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Plus className="h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-500">Add Image</span>
              </label>
            )}
          </div>

          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
            type="submit"
          >
            Sign Up
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          If you Already Registered?{" "}
          <Link
            to="/signin"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Click here
          </Link>
        </p>
      </div>
    </div>
  );
}