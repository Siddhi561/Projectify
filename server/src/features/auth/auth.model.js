import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name must be less than 50 characters'],
    },

    email: {
        type: String,
        required: [true, ['Email is required']],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
        required: function () {
        return !this.googleId;
    },
    },
    avatar: {
        type: String,
        default: null,
    },
    googleId: {
        type: String,
        default: null,
        index: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },

}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

//safe user object- striping sensitive info
userSchema.methods.toSafeObject = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        avatar: this.avatar,
        isVerified: this.isVerified,
        lastLoginAt: this.lastLoginAt,
        createdAt: this.createdAt,
    };
};

export const User = mongoose.model('User', userSchema);