#[test_only]
module lucky_egg::lucky_egg_tests {
    use iota::random;
    use iota::test_scenario;
    use lucky_egg::lucky_egg::{
        HatchGame,
        HatchedEgg,
        create_game,
        hatch,
        hatch_ten,
        total_hatched_for_test,
        rarity_codes_for_test,
        set_pity_for_test,
        egg_rarity_for_test,
        totals_for_test,
    };

    const ADMIN: address = @0xA;
    const PLAYER: address = @0xB;

    #[test]
    fun test_single_hatch_updates_counters_and_mints() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;

        // Create global Random object (requires sender @0x0)
        test_scenario::next_tx(test, @0x0);
        random::create_for_testing(test_scenario::ctx(test));

        // Publish shared game state
        test_scenario::next_tx(test, ADMIN);
        create_game(
            b"ipfs://common",
            b"ipfs://rare",
            b"ipfs://epic",
            b"ipfs://legendary",
            test_scenario::ctx(test),
        );

        // Borrow shared objects
        test_scenario::next_tx(test, ADMIN);
        let mut game = test_scenario::take_shared<HatchGame>(test);
        test_scenario::next_tx(test, ADMIN);
        let random_obj = test_scenario::take_shared<random::Random>(test);

        // Player hatches once
        test_scenario::next_tx(test, PLAYER);
        hatch(&mut game, &random_obj, test_scenario::ctx(test));
        assert!(total_hatched_for_test(&game) == 1, 0);

        // Return shared objects
        test_scenario::next_tx(test, ADMIN);
        test_scenario::return_shared<HatchGame>(game);
        test_scenario::return_shared<random::Random>(random_obj);

        // Player should receive an egg NFT
        test_scenario::next_tx(test, PLAYER);
        let egg = test_scenario::take_from_sender<HatchedEgg>(test);
        test_scenario::return_to_sender<HatchedEgg>(test, egg);

        test_scenario::end(scenario);
    }

    #[test]
    fun test_hatch_ten_updates_counter() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;

        test_scenario::next_tx(test, @0x0);
        random::create_for_testing(test_scenario::ctx(test));

        test_scenario::next_tx(test, ADMIN);
        create_game(
            b"ipfs://common",
            b"ipfs://rare",
            b"ipfs://epic",
            b"ipfs://legendary",
            test_scenario::ctx(test),
        );

        test_scenario::next_tx(test, ADMIN);
        let mut game = test_scenario::take_shared<HatchGame>(test);
        test_scenario::next_tx(test, ADMIN);
        let random_obj = test_scenario::take_shared<random::Random>(test);

        test_scenario::next_tx(test, PLAYER);
        hatch_ten(&mut game, &random_obj, test_scenario::ctx(test));
        assert!(total_hatched_for_test(&game) == 10, 1);
        let (_, _, epic_total, legendary_total) = totals_for_test(&game);
        assert!(epic_total + legendary_total >= 1, 2);

        test_scenario::next_tx(test, ADMIN);
        test_scenario::return_shared<HatchGame>(game);
        test_scenario::return_shared<random::Random>(random_obj);

        test_scenario::end(scenario);
    }

    #[test]
    fun test_hard_pity_forces_legendary() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;

        test_scenario::next_tx(test, @0x0);
        random::create_for_testing(test_scenario::ctx(test));

        test_scenario::next_tx(test, ADMIN);
        create_game(
            b"ipfs://common",
            b"ipfs://rare",
            b"ipfs://epic",
            b"ipfs://legendary",
            test_scenario::ctx(test),
        );

        test_scenario::next_tx(test, ADMIN);
        let mut game = test_scenario::take_shared<HatchGame>(test);
        test_scenario::next_tx(test, ADMIN);
        let random_obj = test_scenario::take_shared<random::Random>(test);

        // Set pity to >= HARD_PITY to guarantee legendary.
        test_scenario::next_tx(test, ADMIN);
        set_pity_for_test(&mut game, PLAYER, 100);

        test_scenario::next_tx(test, PLAYER);
        hatch(&mut game, &random_obj, test_scenario::ctx(test));

        test_scenario::next_tx(test, PLAYER);
        let egg = test_scenario::take_from_sender<HatchedEgg>(test);
        let (_, _, _, legendary_code) = rarity_codes_for_test();
        assert!(egg_rarity_for_test(&egg) == legendary_code, 2);
        test_scenario::return_to_sender<HatchedEgg>(test, egg);

        test_scenario::next_tx(test, ADMIN);
        test_scenario::return_shared<HatchGame>(game);
        test_scenario::return_shared<random::Random>(random_obj);

        test_scenario::end(scenario);
    }
}
