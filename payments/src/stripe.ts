// file to intilzze stripe so we dont ahve looped improts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_KEY! , {
    apiVersion : "2026-04-22.dahlia"
}) ;