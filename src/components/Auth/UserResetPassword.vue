<template>
	<div class="p-2">
		<div class="row">
			<div class="col-12 col-sm-6">
				<div class="d-flex flex-column justify-content-between h-100">
					<h3 style="color: #000">Access this document anytime</h3>
					<p>Hi {{ profile.first_name }},</p>
					<p>Enter a password and create an account to gain access to your document anytime</p>

					<div class="row">
						<div class="col-12">
							<div class="input-group input-group-merge mb-1">
								<input type="email" class="form-control form-control-merge" :value="profile.email" readonly />
							</div>
						</div>

						<div class="col-12 col-md-6">
							<div class="input-group input-group-merge">
								<input
									v-model="newPassword"
									:type="passwordFieldType"
									class="form-control form-control-merge"
									@input="password_check"
									placeholder="Password*"
									autocomplete="new-password"
								/>
								<span class="input-group-text cursor-pointer" @click="togglePassword">
									<Icon icon="bi:eye" style="font-size: 1.5rem" v-show="show" />
									<Icon icon="bi:eye-slash" style="font-size: 1.5rem" v-show="!show" />
								</span>
							</div>
						</div>

						<div class="col-12 col-md-6">
							<div class="input-group input-group-merge">
								<input
									v-model="confirmPassword"
									:type="passwordFieldType"
									class="form-control form-control-merge"
									@input="password_check"
									placeholder="Confirm Password*"
									autocomplete="new-password"
								/>
								<span class="input-group-text cursor-pointer" @click="togglePassword">
									<Icon icon="bi:eye" style="font-size: 1.5rem" v-show="show" />
									<Icon icon="bi:eye-slash" style="font-size: 1.5rem" v-show="!show" />
								</span>
							</div>
						</div>
					</div>

					<template v-if="progress > 0">
						<div class="progress my-1" style="height: 6px">
							<div
								class="progress-bar"
								role="progressbar"
								:style="{
									width: progressLevel.percentage + '%',
									backgroundColor: progressLevel.color,
								}"
								:aria-valuenow="progressLevel.percentage"
								aria-valuemin="0"
								aria-valuemax="100"
							></div>
						</div>

						<p>
							Password Strength:
							<span :style="{ color: progressLevel.color }">
								{{ progressLevel.text }}
							</span>
						</p>

						<div class="row">
							<div class="col-12 col-sm-6">
								<p class="small mb-0" :class="[progress > 7 ? 'text-success' : 'text-danger']">
									<CheckerIcon />
									At least 8 characters
								</p>
								<p class="small mb-0" :class="[has_uppercase ? 'text-success' : 'text-danger']">
									<CheckerIcon />
									Has a capital letter
								</p>
								<p class="small mb-0" :class="[has_lowercase ? 'text-success' : 'text-danger']">
									<CheckerIcon />
									Has a lowercase letter
								</p>
							</div>
							<div class="col-12 col-sm-6 pe-0">
								<p class="small mb-0" :class="[has_number ? 'text-success' : 'text-danger']">
									<CheckerIcon />
									Has a number
								</p>
								<p class="small mb-0" :class="[has_special ? 'text-success' : 'text-danger']">
									<CheckerIcon />
									Has a special character
								</p>
								<p class="text-secondary small" :class="[has_password_matched ? 'text-success' : 'text-danger']">
									<CheckerIcon />
									Password match
								</p>
							</div>
						</div>
					</template>

					<div class="form-check my-1">
						<input
							class="form-check-input"
							type="checkbox"
							value=""
							id="invalidCheck"
							@change="handleCheck($event)"
							:checked="isChecked"
						/>
						<label class="form-check-label" for="invalidCheck">
							I agree to
							<a href="https://www.gettonote.com/privacy" target="_blank">Privacy Policy</a>
							&amp;
							<a href="https://www.gettonote.com/terms" target="_blank">Terms and Conditions</a>
						</label>
					</div>

					<div class="col-12">
						<button
							type="submit"
							class="btn w-100 btn-primary"
							@click="changePassword"
							:disabled="!valid_password || !isChecked"
						>
							<span v-show="loading" class="spinner-border spinner-border-sm"></span>
							Create an account
						</button>
					</div>
					<div class="col-12 my-1">
						<button type="button" class="btn btn-outline-secondary w-100 text-darker" @click="$emit('save', false)">
							<span v-show="loading" class="spinner-border spinner-border-sm"></span>
							Skip
						</button>
					</div>
				</div>
			</div>

			<div class="col-12 col-sm-6">
				<GuestSwiper />
			</div>
		</div>
	</div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import CheckerIcon from '@/icons/CheckerIcon.vue';
import GuestSwiper from '@/components/GuestSwiper.vue';

import { ref, computed, onMounted } from 'vue';

onMounted(() => {
	newPassword.value = '';
	confirmPassword.value = '';
});

import { useGetters, useActions } from 'vuex-composition-helpers/dist';

const { profile, OTPFlag, userDocument, documentOTP } = useGetters({
	profile: 'auth/profile',
	OTPFlag: 'auth/OTPFlag',
	documentOTP: 'auth/documentOTP',
	userDocument: 'document/userDocument',
});

const { resetPassword, isGuest } = useActions({
	resetPassword: 'auth/resetPassword',
	isGuest: 'document/isGuest',
});

const show = ref(false);
const isChecked = ref(false);
const loading = ref(false);
const progress = ref(0);
const has_number = ref(false);
const has_lowercase = ref(false);
const has_uppercase = ref(false);
const has_special = ref(false);
const has_password_matched = ref(false);
const valid_password = ref(false);

const handleCheck = (e) => {
	isChecked.value = e.target.checked ?? false;
};

const progressLevel = computed(() => {
	let theProgress = null;
	theProgress =
		progress.value < 4
			? { percentage: 25, color: '#FB0066', text: 'Weak 😖' }
			: progress.value < 6
			? { percentage: 50, color: '#FBDC00', text: 'Fair 😟' }
			: progress.value < 10
			? { percentage: 75, color: '#25CCD7', text: 'Almost there 😉' }
			: { percentage: 100, color: '#5BCC7A', text: 'Strong 😎💪' };

	return theProgress;
});

const changePassword = () => {
	if (valid_password.value == false) return;
	loading.value = true;
	valid_password.value = false;

	const passwordObj = {
		email: profile.value.email,
		document_id: userDocument.value.id,
		document_otp: documentOTP.value,
		password: newPassword.value,
	};

	resetPassword(passwordObj);
	isGuest({ openGuestModal: false });
	if (!OTPFlag.value.guest) {
		loading.value = false;
	}
};

const passwordFieldType = ref('password');
const togglePassword = () => {
	show.value = !show.value;
	passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const newPassword = ref('');
const confirmPassword = ref('');

const password_check = () => {
	progress.value = newPassword.value.length;
	has_number.value = /\d/.test(newPassword.value);
	has_lowercase.value = /[a-z]/.test(newPassword.value);
	has_uppercase.value = /[A-Z]/.test(newPassword.value);
	has_special.value = /[ !@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/.test(newPassword.value);
	has_password_matched.value = newPassword.value === confirmPassword.value;

	if (
		has_number.value &&
		has_lowercase.value &&
		has_uppercase.value &&
		has_special.value &&
		has_password_matched.value &&
		newPassword.value.length > 7
	) {
		valid_password.value = true;
	} else {
		valid_password.value = false;
	}
};
</script>

<style scoped></style>
