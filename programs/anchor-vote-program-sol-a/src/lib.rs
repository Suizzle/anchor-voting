use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

//declare_id!("B9EUJbE3DNXR3NxPULazqnVqKH9DUENhB4szirLzYpRd");
declare_id!("6xB7MvgYXXH3FFsrhvoJJu6QqxhLN1yLcUzTAnfnbEzS");



#[program]
pub mod anchor_scorekeeper {
    
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, _user: String) -> Result<()> {
        ctx.accounts.count.score = 0;
        ctx.accounts.count.bump = ctx.bumps.count;
        Ok(())
    }

    pub fn increment(ctx: Context<Count>, _user: String) -> Result<()> {
        ctx.accounts.count.score += 1;
        Ok(())
    }

    pub fn decrement(ctx: Context<Count>, _user: String) -> Result<()> {
        ctx.accounts.count.score -= 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_user: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = CountState::INIT_SPACE,
        seeds = [hash(_user.as_bytes()).to_bytes().as_ref()],
        bump
    )]
    count: Account<'info, CountState>,
    system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(_user: String)]
pub struct Count<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    #[account(
        mut,
        seeds = [hash(_user.as_bytes()).to_bytes().as_ref()],
        bump = count.bump
    )]
    count: Account<'info, CountState>,
    system_program: Program<'info, System>
}

#[account]
pub struct CountState {
    score: i64,
    bump: u8
}

impl Space for CountState {
    const INIT_SPACE: usize = 8 + 8 + 1;
}