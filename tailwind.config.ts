import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'cinzel': ['Cinzel', 'Times New Roman', 'serif'],
				'crimson': ['Crimson Text', 'Times New Roman', 'serif'],
				serif: ['Crimson Text', 'Times New Roman', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced game colors
				game: {
					board: 'hsl(var(--board-bg))',
					water: 'hsl(var(--water))',
					land: 'hsl(var(--land))',
					church: 'hsl(var(--game-church))',
					synagogue: 'hsl(var(--game-synagogue))',
				},
				// Player colors
				player: {
					1: 'hsl(var(--player-1))',
					2: 'hsl(var(--player-2))',
					3: 'hsl(var(--player-3))',
					4: 'hsl(var(--player-4))',
					5: 'hsl(var(--player-5))',
					6: 'hsl(var(--player-6))',
				},
				// Special tile colors
				special: {
					gold: 'hsl(var(--special-gold))',
					prison: 'hsl(var(--prison-gray))',
					court: 'hsl(var(--court-red))',
					chance: 'hsl(var(--chance-orange))',
					community: 'hsl(var(--community-blue))',
					sacrifice: 'hsl(var(--sacrifice-crimson))',
				},
			},
			backgroundImage: {
				'gradient-board': 'var(--gradient-board)',
				'gradient-parchment': 'var(--gradient-parchment)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-ancient': 'var(--gradient-ancient)',
				'gradient-royal': 'var(--gradient-royal)',
			},
			boxShadow: {
				'ancient': 'var(--shadow-ancient)',
				'glow': 'var(--shadow-glow)',
				'elevated': 'var(--shadow-elevated)',
				'deep': 'var(--shadow-deep)',
			},
			backdropBlur: {
				'ancient': 'var(--backdrop-blur)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				"fade-in": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				"scale-in": {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				"fade-in": "fade-in 0.3s ease-out",
				"scale-in": "scale-in 0.2s ease-out",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
