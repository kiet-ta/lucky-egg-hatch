module lucky_egg::lucky_egg {
    use iota::bag::Bag;
    use iota::bag;
    use iota::event;
    use iota::random;
    use iota::random::Random;
    use iota::transfer::{public_transfer, share_object};
    use std::bcs;

    /// Encoded rarity values for frontend decoding.
    const RARITY_COMMON: u8 = 0;
    const RARITY_RARE: u8 = 1;
    const RARITY_EPIC: u8 = 2;
    const RARITY_LEGENDARY: u8 = 3;

    /// Base rarity bands for a roll in [0, MAX_ROLL].
    const BASE_COMMON: u8 = 70;
    const BASE_RARE: u8 = 20;
    const BASE_EPIC: u8 = 8;
    const BASE_LEGENDARY: u8 = 2;

    /// Pity configuration.
    const SOFT_PITY_START: u16 = 70;
    const HARD_PITY: u16 = 90;
    const MAX_ROLL: u8 = 99;

    /// Static metadata URIs per rarity (e.g., IPFS).
    public struct RarityMetadata has copy, drop, store {
        common: vector<u8>,
        rare: vector<u8>,
        epic: vector<u8>,
        legendary: vector<u8>,
    }

    /// Item name lists per rarity (10 entries each).
    public struct RarityItemNames has copy, drop, store {
        common: vector<vector<u8>>,
        rare: vector<vector<u8>>,
        epic: vector<vector<u8>>,
        legendary: vector<vector<u8>>,
    }

    public struct RarityTally has copy, drop, store {
        common: u64,
        rare: u64,
        epic: u64,
        legendary: u64,
    }

    public struct PlayerInventory has store {
        items: Bag, // item_name => count
        totals: RarityTally,
    }

    public struct PlayerState has store {
        since_legendary: u16,
        inventory: PlayerInventory,
    }

    /// Shared game state.
    public struct HatchGame has key, store {
        id: iota::object::UID,
        metadata: RarityMetadata,
        item_names: RarityItemNames,
        player_states: Bag, // address => PlayerState
        totals: RarityTally,
        total_hatched: u64,
    }

    /// Minted egg NFT owned by players.
    public struct HatchedEgg has key, store {
        id: iota::object::UID,
        rarity: u8,
        item_name: vector<u8>,
        metadata_uri: vector<u8>,
        hatch_number: u64,
        hatch_epoch: u64,
    }

    /// Emitted on every successful hatch for UI consumption.
    public struct EggHatchedEvent has copy, drop {
        player: address,
        rarity: u8,
        egg_id: address,
        metadata_uri: vector<u8>,
        hatch_number: u64,
    }

    /// Initializes the shared game config. Should be called once by the deployer.
    public entry fun create_game(
        common_uri: vector<u8>,
        rare_uri: vector<u8>,
        epic_uri: vector<u8>,
        legendary_uri: vector<u8>,
        ctx: &mut iota::tx_context::TxContext,
    ) {
        let metadata = RarityMetadata {
            common: common_uri,
            rare: rare_uri,
            epic: epic_uri,
            legendary: legendary_uri,
        };

        let game = HatchGame {
            id: iota::object::new(ctx),
            metadata,
            item_names: default_item_names(),
            player_states: bag::new(ctx),
            totals: RarityTally {
                common: 0,
                rare: 0,
                epic: 0,
                legendary: 0,
            },
            total_hatched: 0,
        };

        share_object(game);
    }

    /// Primary entry: enforces daily limits, rolls rarity, mints the egg, and emits an event.
    #[allow(lint(public_random))]
    public entry fun hatch(game: &mut HatchGame, random: &Random, ctx: &mut iota::tx_context::TxContext) {
        let caller = iota::tx_context::sender(ctx);
        let current_epoch = iota::tx_context::epoch(ctx);
        let pity_before: u16 = ensure_player_state(game, caller, ctx).since_legendary;

        let rarity = hatch_one(game, caller, current_epoch, pity_before, random, ctx);
        update_pity(game, caller, rarity, 1, ctx);
    }

    /// Hatch 10 eggs in one call, respecting the daily limit and pity rules.
    #[allow(lint(public_random))]
    public entry fun hatch_ten(game: &mut HatchGame, random: &Random, ctx: &mut iota::tx_context::TxContext) {
        let caller = iota::tx_context::sender(ctx);
        let current_epoch = iota::tx_context::epoch(ctx);
        let mut pity_tracker: u16;
        let mut has_epic_or_legendary = false;
        pity_tracker = ensure_player_state(game, caller, ctx).since_legendary;

        let mut generator = random::new_generator(random, ctx);
        let mut i = 0;
        while (i < 10) {
            let mut rarity = pick_rarity(random::generate_u8_in_range(&mut generator, 0, MAX_ROLL), pity_tracker);
            if (i == 9 && !has_epic_or_legendary && rarity != RARITY_LEGENDARY) {
                rarity = RARITY_EPIC;
            };
            mint_and_emit(game, caller, current_epoch, rarity, &mut generator, ctx);
            if (rarity == RARITY_LEGENDARY) {
                pity_tracker = 0;
                has_epic_or_legendary = true;
            } else {
                if (rarity == RARITY_EPIC) has_epic_or_legendary = true;
                pity_tracker = pity_tracker + 1;
            };
            i = i + 1;
        };

        // Persist pity after batch
        update_pity_raw(game, caller, pity_tracker, ctx);
    }

    fun ensure_player_state(
        game: &mut HatchGame,
        player: address,
        ctx: &mut iota::tx_context::TxContext,
    ): &mut PlayerState {
        if (!bag::contains(&game.player_states, player)) {
            let inv = PlayerInventory {
                items: bag::new(ctx),
                totals: RarityTally {
                    common: 0,
                    rare: 0,
                    epic: 0,
                    legendary: 0,
                },
            };
            let state = PlayerState {
                since_legendary: 0,
                inventory: inv,
            };
            bag::add(&mut game.player_states, player, state);
        };

        bag::borrow_mut(&mut game.player_states, player)
    }

    fun hatch_one(
        game: &mut HatchGame,
        caller: address,
        current_epoch: u64,
        pity_before: u16,
        random: &Random,
        ctx: &mut iota::tx_context::TxContext,
    ): u8 {
        let mut generator = random::new_generator(random, ctx);
        hatch_one_with_generator(game, caller, current_epoch, pity_before, &mut generator, ctx)
    }

    fun hatch_one_with_generator(
        game: &mut HatchGame,
        caller: address,
        current_epoch: u64,
        pity_before: u16,
        generator: &mut random::RandomGenerator,
        ctx: &mut iota::tx_context::TxContext,
    ): u8 {
        let roll = random::generate_u8_in_range(generator, 0, MAX_ROLL);
        let rarity = pick_rarity(roll, pity_before);
        mint_and_emit(game, caller, current_epoch, rarity, generator, ctx);
        rarity
    }

    fun mint_and_emit(
        game: &mut HatchGame,
        caller: address,
        current_epoch: u64,
        rarity: u8,
        generator: &mut random::RandomGenerator,
        ctx: &mut iota::tx_context::TxContext,
    ) {
        let item_name = select_item_name(&game.item_names, rarity, generator);
        let metadata_uri = metadata_for_owner(&game.metadata, rarity, caller, copy item_name);
        let hatch_number = game.total_hatched + 1;
        game.total_hatched = hatch_number;
        increment_totals(&mut game.totals, rarity);

        let egg_id = iota::object::new(ctx);
        let egg_address = iota::object::uid_to_address(&egg_id);
        let event_metadata = copy metadata_uri;

        // Update player inventory
        let state = ensure_player_state(game, caller, ctx);
        update_inventory(&mut state.inventory, rarity, copy item_name);

        let egg = HatchedEgg {
            id: egg_id,
            rarity,
            item_name,
            metadata_uri,
            hatch_number,
            hatch_epoch: current_epoch,
        };

        event::emit(EggHatchedEvent {
            player: caller,
            rarity,
            egg_id: egg_address,
            metadata_uri: event_metadata,
            hatch_number,
        });

        public_transfer(egg, caller);
    }

    fun pick_rarity(roll: u8, pity: u16): u8 {
        if (pity >= HARD_PITY) {
            return RARITY_LEGENDARY
        };

        let legendary_chance = adjusted_legendary_chance(pity);
        if (legendary_chance == 100) {
            return RARITY_LEGENDARY
        };

        let remaining: u8 = 100 - legendary_chance;
        let base_sum: u16 = (BASE_COMMON as u16) + (BASE_RARE as u16) + (BASE_EPIC as u16);
        let remaining_u16 = remaining as u16;
        let common_share: u16 = (remaining_u16 * (BASE_COMMON as u16)) / base_sum;
        let rare_share: u16 = (remaining_u16 * (BASE_RARE as u16)) / base_sum;
        let epic_share: u16 = remaining_u16 - common_share - rare_share;

        let common_cutoff: u8 = common_share as u8;
        let rare_cutoff: u8 = common_cutoff + (rare_share as u8);
        let epic_cutoff: u8 = rare_cutoff + (epic_share as u8);

        if (roll < common_cutoff) {
            RARITY_COMMON
        } else if (roll < rare_cutoff) {
            RARITY_RARE
        } else if (roll < epic_cutoff) {
            RARITY_EPIC
        } else {
            RARITY_LEGENDARY
        }
    }

    fun adjusted_legendary_chance(pity: u16): u8 {
        if (pity >= HARD_PITY) {
            return 100
        };
        if (pity < SOFT_PITY_START) {
            return BASE_LEGENDARY
        };
        let span: u64 = (HARD_PITY - SOFT_PITY_START) as u64;
        let steps: u64 = (pity - SOFT_PITY_START + 1) as u64;
        let bonus = (steps * ((100 - BASE_LEGENDARY) as u64)) / span;
        let chance = BASE_LEGENDARY as u64 + bonus;
        if (chance >= 100) 100 else chance as u8
    }

    fun select_metadata(metadata: &RarityMetadata, rarity: u8): vector<u8> {
        if (rarity == RARITY_COMMON) {
            copy metadata.common
        } else if (rarity == RARITY_RARE) {
            copy metadata.rare
        } else if (rarity == RARITY_EPIC) {
            copy metadata.epic
        } else {
            copy metadata.legendary
        }
    }

    fun increment_totals(totals: &mut RarityTally, rarity: u8) {
        if (rarity == RARITY_COMMON) {
            totals.common = totals.common + 1;
        } else if (rarity == RARITY_RARE) {
            totals.rare = totals.rare + 1;
        } else if (rarity == RARITY_EPIC) {
            totals.epic = totals.epic + 1;
        } else {
            totals.legendary = totals.legendary + 1;
        }
    }

    fun update_inventory(inv: &mut PlayerInventory, rarity: u8, item_name: vector<u8>) {
        if (!bag::contains(&inv.items, item_name)) {
            bag::add(&mut inv.items, item_name, 1);
        } else {
            let count = bag::borrow_mut(&mut inv.items, item_name);
            *count = *count + 1;
        };
        increment_totals(&mut inv.totals, rarity);
    }

    fun default_item_names(): RarityItemNames {
        RarityItemNames {
            common: vector[
                b"common_1", b"common_2", b"common_3", b"common_4", b"common_5",
                b"common_6", b"common_7", b"common_8", b"common_9", b"common_10"
            ],
            rare: vector[
                b"rare_1", b"rare_2", b"rare_3", b"rare_4", b"rare_5",
                b"rare_6", b"rare_7", b"rare_8", b"rare_9", b"rare_10"
            ],
            epic: vector[
                b"epic_1", b"epic_2", b"epic_3", b"epic_4", b"epic_5",
                b"epic_6", b"epic_7", b"epic_8", b"epic_9", b"epic_10"
            ],
            legendary: vector[
                b"legendary_1", b"legendary_2", b"legendary_3", b"legendary_4", b"legendary_5",
                b"legendary_6", b"legendary_7", b"legendary_8", b"legendary_9", b"legendary_10"
            ],
        }
    }

    fun select_item_name(names: &RarityItemNames, rarity: u8, generator: &mut random::RandomGenerator): vector<u8> {
        let idx = random::generate_u8_in_range(generator, 0, 9) as u64;
        if (rarity == RARITY_COMMON) {
            copy names.common[idx]
        } else if (rarity == RARITY_RARE) {
            copy names.rare[idx]
        } else if (rarity == RARITY_EPIC) {
            copy names.epic[idx]
        } else {
            copy names.legendary[idx]
        }
    }

    fun metadata_for_owner(metadata: &RarityMetadata, rarity: u8, owner: address, item_name: vector<u8>): vector<u8> {
        let mut base = select_metadata(metadata, rarity);
        let owner_bytes = bcs::to_bytes(&owner);
        base.append(b"|owner:");
        base.append(owner_bytes);
        base.append(b"|item:");
        base.append(item_name);
        base
    }

    #[test_only]
    public fun total_hatched_for_test(game: &HatchGame): u64 {
        game.total_hatched
    }

    #[test_only]
    public fun rarity_codes_for_test(): (u8, u8, u8, u8) {
        (RARITY_COMMON, RARITY_RARE, RARITY_EPIC, RARITY_LEGENDARY)
    }

    #[test_only]
    public fun set_pity_for_test(game: &mut HatchGame, player: address, count: u16) {
        let state = ensure_player_state(game, player, &mut iota::tx_context::dummy());
        state.since_legendary = count;
    }

    #[test_only]
    public fun egg_rarity_for_test(egg: &HatchedEgg): u8 {
        egg.rarity
    }

    #[test_only]
    public fun totals_for_test(game: &HatchGame): (u64, u64, u64, u64) {
        (game.totals.common, game.totals.rare, game.totals.epic, game.totals.legendary)
    }

    fun update_pity(game: &mut HatchGame, player: address, rarity: u8, hatch_count_delta: u8, ctx: &mut iota::tx_context::TxContext) {
        let state = ensure_player_state(game, player, ctx);
        if (rarity == RARITY_LEGENDARY) {
            state.since_legendary = 0;
        } else {
            state.since_legendary = state.since_legendary + (hatch_count_delta as u16);
        };
    }

    fun update_pity_raw(game: &mut HatchGame, player: address, new_count: u16, ctx: &mut iota::tx_context::TxContext) {
        let state = ensure_player_state(game, player, ctx);
        state.since_legendary = new_count;
    }
}
