import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Compressor from 'compressorjs';
import { X, Plus } from 'lucide-react'; 

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length + images.length > 1) {
      alert('Maximum 1 image allowed');
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImages(prev => [...prev, ...files]);
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
      images.map(image => {
        return new Promise((resolve, reject) => {
          new Compressor(image, {
            quality: 0.6,
            success(result) {
              resolve({
                url: URL.createObjectURL(result),
                file: result
              });
            },
            error(err) {
              reject(err);
            }
          });
        });
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true)
      const compressedImages = await compressImages(images);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);

      compressedImages.forEach((image) => {
        formData.append('images', image.file);
      });

      const response = await fetch(`https://samzraa.onrender.com/api/users/signUp`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to register');
      }

      const data = await response.json();
      if (data.success || response.ok) {
        alert('Sign up successful!');
        navigate('/signin');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message || 'An error occurred during registration');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Sign Up</h2>
      <div>
        {imagePreviews.map((preview, index) => (
          <div key={index} className= " w-20 relative aspect-square">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 -right-3 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {images.length < 1 && (
          <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-square w-20 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 mx-auto" />
              <span className="text-sm text-gray-500 mt-2">Add Image</span>
            </div>
          </label>
        )}
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-lg border bg-amber-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-lg border bg-amber-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-4 py-3 rounded-lg border bg-amber-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">{loading ? 'Wait..':'Sign Up'}</button>
      <Link
        to="/signin"
        className="block text-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
      >
        Already have an account? <span className="font-medium">Sign in</span>
      </Link>
    </form>
  );
}
