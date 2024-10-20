/**
 * @file parser.test.ts
 * @description This file contains unit tests for the YAML parser utility functions.
 * It uses the BDD testing style provided by the `jsr:@std/testing/bdd` module.
 * The tests ensure that the YAML parsing functionality correctly interprets
 * and retrieves pricing information from a YAML file.
 * 
 * The tests perform the following actions:
 * - Before each test, a temporary file is created from a predefined YAML file.
 * - After each test, the temporary file is removed to ensure a clean state.
 * - Positive tests verify that the YAML parsing correctly retrieves the expected pricing information.
 * - Negative tests verify that the YAML parsing throws the expected errors for invalid inputs.
 * 
 * @module tests/yaml/parser.test
 * @requires jsr:@std/testing/bdd
 * @requires ../../src/utils/yaml-utils.ts
 * @requires ../../src/models/pricing.ts
 * @requires ../../src/utils/version-manager.ts
 * @requires @std/csv
 */

import { afterAll, before, beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { retrievePricingFromYaml } from "../../src/utils/yaml-utils.ts";
import { Pricing } from "../../src/models/pricing.ts";
import assert from "assert";
import { LATEST_PRICING2YAML_VERSION } from "../../src/utils/version-manager.ts";
import {v4 as uuidv4 } from "uuid";
import { parseCSVContent, readCSVFile } from "../utils/csv-utils.ts";

const POSITIVE_TESTS_CSV_PATH = "tests/yaml/data/positive-parsing-tests.csv";
const NEGATIVE_TESTS_CSV_PATH = "tests/yaml/data/negative-parsing-tests.csv";
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

interface Test{
    testName: string,
    pricingPath: string,
    expected: string
}

interface TestSection{
    sectionName: string,
    tests: Test[]
}

const positiveTestsParameters = parseCSVContent(readCSVFile(POSITIVE_TESTS_CSV_PATH));
const negativeTestsParameters = parseCSVContent(readCSVFile(NEGATIVE_TESTS_CSV_PATH));

describe("Positive Pricing2Yaml Parser Tests", () => {

    beforeAll(() => {
        Deno.mkdir(TEMP_DIR);
    })

    afterAll(() => {
        Deno.removeSync(TEMP_DIR, {recursive: true});
    })

    for (const {sectionName, tests} of positiveTestsParameters){
        describe(sectionName, () => {
            for (const {pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                before(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    Deno.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${expected} parsing`, () => {
                    const pricing: Pricing = retrievePricingFromYaml(tempPricingPath);
    
                    assert.equal(pricing.saasName, expected);
                    assert.equal(pricing.version, LATEST_PRICING2YAML_VERSION);
                    assert(pricing.createdAt instanceof Date);
                });
            }}
        );
    }
});

describe("Negative Pricing2Yaml Parser Tests", () => {

    beforeAll(() => {
        Deno.mkdir(TEMP_DIR);
    })

    afterAll(() => {
        Deno.removeSync(TEMP_DIR, {recursive: true});
    })

    for (const {sectionName, tests} of negativeTestsParameters) {
        describe(sectionName, () => {
            for (const {testName, pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                before(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    Deno.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${testName}`, () => {
                    try {
                        const _pricing: Pricing = retrievePricingFromYaml(tempPricingPath);
                        assert(false, "Expected an error to be thrown");
                    } catch (error) {
                        assert.equal((error as Error).message, expected);
                    }
                });
            }
        });
    }
});
